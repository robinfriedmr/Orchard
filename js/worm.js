// Worm 7/21/2017 7:57

// This game is an amalgamation of original code, code inspired by the Discover Phaser tutorial, and Danny Markov's "Making Your First HTML5 Game With Phaser" tutorial on tutorialzine.com.

var isPressed = true; // this is a variable temporarily needed to get the overlap with goal function tested. 

var worm, decay, nutrient, holding,
    speed, boost, rootpain,
    updateDelayW, direction, new_direction;

const SQUARESIZE = 15;
const BASESPEED = 10;

var wormState = {

    create: function () {

        if (!game.device.desktop) {
            this.addMobileInputs();
        }

        // Arrow and space keys
        this.cursor = game.input.keyboard.createCursorKeys();
        this.depositButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };

        // The arrow keys and spacebar will only ever affect the game, not the browswer window.
        game.input.keyboard.addKeyCapture(
            [Phaser.Keyboard.UP, Phaser.Keyboard.DOWN,
             Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
             Phaser.Keyboard.SPACEBAR]
        );

        // Define roots
        this.roots = [];

        // Add map 
        this.createWorld();

        worm = []; // This will work as a stack, containing the parts of our worm
        decay = []; // An array for the decay.
        nutrient = []; // An array for deposited nutrients.
        holding = 0; // A counter for how much the worm is carrying at a given time. 

        speed = 0; // Game speed.
        boost = 0; // NEW SPEED MODIFIER
        rootpain = 0; // NEW SPEED MODIFIER

        updateDelayW = 0; // A variable for control over update rates.
        direction = 'right'; // The direction of our worm.
        new_direction = null; // A buffer to store the new direction into.

        // Add sprites to the game.
        this.goal = game.add.sprite(game.width / 2, 0, 'goal');
        this.goal.anchor.setTo(0.5, 0);

        for (var i = 0; i < 10; i++) {
            worm[i] = game.add.sprite(150 + i * SQUARESIZE, 150, 'wormsquare');
        }

        // Score labels
        this.wScoreLabel = game.add.text(game.width - 12, game.height - 10, 'Trees Planted: 0', {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.wScoreLabel.anchor.setTo(1, 1);

        this.devoured = 0;
        decayDevoured = game.add.text(game.width / 2, game.height - 10, 'Nutrients Held: ' + this.devoured, {
            font: '16px Arial',
            fill: '#ffffff'
        });
        decayDevoured.anchor.setTo(0.5, 1);

        this.delivered = 0;
        nutrientsDelivered = game.add.text(12, game.height - 10, 'Nutrients Delivered: ' + this.delivered, {
            font: '16px Arial',
            fill: '#ffffff'
        });
        nutrientsDelivered.anchor.setTo(0, 1);

        // Enable overlap physics.
        game.physics.arcade.enable(worm, Phaser.Physics.ARCADE);
        game.physics.arcade.enable(this.goal, Phaser.Physics.ARCADE);

        // Genereate the first three pieces of decay.
        for (i = 0; i < 5; i++) {
            this.newDecay();
        }

        if (!game.device.desktop) {
            // Create an empty label to write the error message if needed
            this.rotateLabel = game.add.text(game.width / 2, game.height / 2, '', {
                font: '30px Arial',
                fill: '#fff',
                backgroundColor: '#000'
            });
            this.rotateLabel.anchor.setTo(0.5, 0.5);
            // Call 'orientationChange' when the device is rotated
            game.scale.onOrientationChange.add(this.orientationChange, this);
            // Call the function at least once
            this.orientationChange();
        }

        //       game.input.onDown.add(this.makeTrue, this); // CODE FOR CLICKING.
    },

    update: function () {

        //        if (!game.input.activePointer.leftButton.isDown) { // CODE FOR CLICKING.
        //            this.makeFalse();
        //            wasCalled = false;
        //        }

        // Is the worm's end over the goal? 
        game.physics.arcade.overlap(worm[0], this.goal, this.depositNutrient, null, this);

        // Use the arrow keys to determine the worm's new direction, while preventing illegal directions.
        var firstCell = worm[worm.length - 1];
        if ((this.cursor.right.isDown || this.wasd.right.isDown) && direction != 'left' && firstCell.x < (game.width - SQUARESIZE)) {
            new_direction = 'right';
        } else if ((this.cursor.left.isDown || this.wasd.left.isDown) && direction != 'right' && firstCell.x > SQUARESIZE) {
            new_direction = 'left';
        } else if ((this.cursor.up.isDown || this.wasd.up.isDown) && direction != 'down' && firstCell.y > 0) {
            new_direction = 'up';
        } else if ((this.cursor.down.isDown || this.wasd.down.isDown) && direction != 'up' && firstCell.y < (game.height - SQUARESIZE)) {
            new_direction = 'down';
        }

        rootpain = Math.min(10, rootpain); // Set rootpain to at most 10.
        boost = Math.min(9, boost); // Set boost to at most 9

        // Run this code every (speed calculation) runs through "update."
        updateDelayW++;
        if (updateDelayW % (BASESPEED + rootpain - boost) == 0) {
            // Worm movement
            //firstCell is now defined above the new-direction code.
            lastCell = worm.shift(),
                oldLastCellx = lastCell.x,
                oldLastCelly = lastCell.y;

            // Check for collisions. Parameter is the head of the worm.
            this.wallCollision(firstCell);
            this.selfCollision(firstCell);
            this.rootCollision(firstCell);
            this.decayCollision(firstCell);

            // If a new direction has been chosen from the keyboard, make it the direction of the worm now. Move that way.
            if (new_direction) {
                direction = new_direction;
                new_direction = null;
            }
            this.wormMovement(lastCell, firstCell);

            if (rootpain > 0) {
                rootpain--;
            }
        }
    },

    wormMovement: function (lastCell, firstCell) {
        // Change the last cell's coordinates relative to the head of the worm, according to the direction.
        if (direction == 'right') {
            lastCell.x = firstCell.x + SQUARESIZE;
            lastCell.y = firstCell.y;
        } else if (direction == 'left') {
            lastCell.x = firstCell.x - SQUARESIZE;
            lastCell.y = firstCell.y;
        } else if (direction == 'up') {
            lastCell.x = firstCell.x;
            lastCell.y = firstCell.y - SQUARESIZE;
        } else if (direction == 'down') {
            lastCell.x = firstCell.x;
            lastCell.y = firstCell.y + SQUARESIZE;
        }
        worm.push(lastCell); // Place the last cell in the front of the stack.
        firstCell = lastCell; // Mark it the first cell.
    },

    wallCollision: function (head) {
        if (direction == 'right' && head.x == (game.width - SQUARESIZE)) {
            new_direction = 'up';
            rootpain = 9;
        } else if (direction == 'left' && head.x == 0) {
            new_direction = 'down';
            rootpain = 9;
        } else if (direction == 'up' && head.y == 0) {
            new_direction = 'left';
            rootpain = 9;
        } else if (direction == 'down' && head.y == (game.height - SQUARESIZE)) {
            new_direction = 'right';
            rootpain = 9;
        }
    },

    selfCollision: function (head) {
        // Check if the head of the worm overlaps with any part of the worm.
        for (var i = 0; i < worm.length - 1; i++) {
            if (head.x == worm[i].x && head.y == worm[i].y) {
                rootpain++;
            }
        }
    },

    rootCollision: function (head) {
        // Check if the head of the worm overlaps with any roots.
        for (var i = 0; i < this.roots.length - 1; i++) {
            if (head.x == this.roots[i].x && head.y == this.roots[i].y) {
                rootpain += 2;
            }
        }
    },

    newDecay: function () {
        // Choose a random place on the grid.
        var randomX = (Math.floor(Math.random() * 38) * SQUARESIZE) + SQUARESIZE,
            randomY = (Math.floor(Math.random() * 21) * SQUARESIZE) + SQUARESIZE;

        // Add a new decay.
        decay[decay.length] = game.add.sprite(randomX, randomY, 'decay');
    },

    decayCollision: function (firstCell) {
        for (var i = 0; i < worm.length; i++) { // If any part of the worm is touching
            for (var j = 0; j < decay.length; j++) { // any of the pieces of decay
                if (worm[i].x == decay[j].x && worm[i].y == decay[j].y) {

                    // Destroy the old decay.
                    decay[j].destroy();
                    // Remove from array (1 element at index j)
                    decay.splice(j, 1);

                    holding++; // How many nutrients are we holding?
                    console.log("Holding: " + holding);
                    this.updateBelly(holding); // Increase the devoured variable by 1.

                    if (holding % 5 == 0) { // Every 5 pieces held...
                        if (boost < 8) {
                            boost += 2; // ...speed up the worm.
                            console.log(boost);
                        } else if (boost = 8) {
                            boost++;
                            console.log(boost);
                        }
                    }
                }
            }
        }
    },

    depositNutrient: function () {
        x = worm[0].x;
        y = worm[0].y;

        if (this.depositButton.isDown && holding > 0) {
            if (isPressed == true) {

                holding--;
                console.log("Now holding " + holding);
                this.updateBelly(holding);

                nutrient[nutrient.length] = game.add.sprite(x, y, 'nutrient');
                Client.sendNutrient();
                this.delivered++;
                this.updateDelivered(this.delivered);

                if (holding % 5 == 0) { // Every 5 pieces held...
                    if (boost > 1) {
                        boost -= 2; // ...speed up the worm.
                        console.log(boost);
                    } else if (boost = 1) {
                        boost--;
                        console.log(boost);
                    }
                }

                isPressed = false; // Set isPressed to false. This block can only run again when it's true.
            }
        }

        if (this.depositButton.isUp) {
            isPressed = true; // Setting this to true only when the button is up makes the above block run only once.
        }

    },

    //    eraseNutrient: function () {
    //        console.log(this.nutrientArray.length);
    //        //console.log("A nutrient is erased.");
    //
    //        which = birdState.getRandomInt(1, this.nutrientArray.length);
    //        this.nutrientArray.splice(which - 1, 1);
    //
    //        console.log(this.nutrientArray.length);
    //    },

    createWorld: function () {
        game.add.image(0, 0, 'wormBG');
        this.drawRoot();
    },

    drawRoot: function () {

        // *** BASE POSITIONS FOR ROOTS *********** 
        // LEFT
        var A = {
            x: 0,
            y: 210
        };
        var B = {
            x: 0,
            y: 120
        };
        // TOP
        var C = {
            x: 30,
            y: 0
        };
        var D = {
            x: 195,
            y: 0
        };
        var E = {
            x: game.width - 195,
            y: 0
        }
        var F = {
            x: game.width - 30 - SQUARESIZE,
            y: 0
        }
        // RIGHT
        var G = {
            x: game.width - SQUARESIZE,
            y: 120
        };
        var H = {
            x: game.width - SQUARESIZE,
            y: 210
        }; // *************************************

        var whichSide = birdState.getRandomInt(0, 10); // Choose where to spawn the root.
        if (whichSide <= 1) { // 20% chance to spawn on the left
            here = 'left';
        } else if (whichSide >= 8) { // 20% chance to spawn on the right
            here = 'right';
        } else { // 60% chance to spawn from the top
            here = 'top';
        }

        var whichSpot = Math.random();

        switch (here) { // Once the side has been decided on, go to that side and...
            case 'left': // ...choose between which two positions the root will go. 
                console.log("left");

                if (whichSpot < 0.5) {
                    var rootX = A.x;
                    var rootY = A.y;
                } else {
                    var rootX = B.x;
                    var rootY = B.y;
                }

                // Place the base accordingly.
                this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');

                var prob = 0.15; // The probability of turning left or right starts at 15%.                

                for (i = 0; i < 10; i++) {
                    if (Math.random() < prob) {
                        rootY += SQUARESIZE;
                        prob = 0.15;
                    } else {
                        rootX += SQUARESIZE;
                        prob += 0.15;
                    }

                    this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');
                }

                break;

            case 'right':
                console.log("right");

                if (whichSpot < 0.5) {
                    var rootX = G.x;
                    var rootY = G.y;
                } else {
                    var rootX = H.x;
                    var rootY = H.y;
                }

                this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');

                var prob = 0.15;

                for (i = 0; i < 10; i++) {
                    if (Math.random() < prob) {
                        rootY += SQUARESIZE;
                        prob = 0.15;
                    } else {
                        rootX -= SQUARESIZE;
                        prob += 0.15;
                    }

                    this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');
                }

                break;

            case 'top':
                console.log("top");

                if (whichSpot < 0.25) {
                    var rootX = C.x;
                    var rootY = C.y;
                } else if (whichSpot >= 0.25 && whichSpot < 0.5) {
                    var rootX = D.x;
                    var rootY = D.y;
                } else if (whichSpot >= 0.5 && whichSpot < 0.75) {
                    var rootX = E.x;
                    var rootY = E.y;
                } else {
                    var rootX = F.x;
                    var rootY = F.y;
                }

                this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');

                var prob = 0.05;

                for (i = 0; i < 10; i++) {
                    if (Math.random() < prob) {
                        if (Math.random() <= 0.5) {
                            rootX -= SQUARESIZE;
                            prob = 0.05
                        } else {
                            rootX += SQUARESIZE;
                            prob = 0.05;
                        }
                    } else {
                        rootY += SQUARESIZE;
                        prob += 0.15;
                    }
                    this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');
                }
        }
    },

    updatewScore: function (wScore) { // This is the "trees planted" score.
        if (this.wScoreLabel) {
            this.wScoreLabel.setText('Trees Planted: ' + wScore);
        }
    },

    updateBelly: function (holding) {
        decayDevoured.setText('Nutrients Held: ' + holding);
    },

    updateDelivered: function (delivered) {
        nutrientsDelivered.setText('Nutrients Delivered: ' + delivered);
    },

    // ****************** MOBILE FUNCTIONS *****************
    //    orientationChange: function () {
    //        // If the game is in portrait (wrong orientation)
    //        if (game.scale.isPortrait) {
    //            // Pause the game and add a text explanation
    //            game.paused = true;
    //            this.rotateLabel.text = 'Rotate to landscape';
    //        }
    //        // If the game is in landscape (good orientation)
    //        else {
    //            // Resume the game and remove the text
    //            game.paused = false;
    //            this.rotateLabel.text = '';
    //        }
    //    },

};
