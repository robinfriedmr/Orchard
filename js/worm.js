// Worm 6/30/2017 13:21

// This game is an amalgamation of original code, code inspired by the Discover Phaser tutorial, and Danny Markov's "Making Your First HTML5 Game With Phaser" tutorial on tutorialzine.com.

var isClicked = false; // this is a variable temporarily needed to get the overlap with goal function tested. 

var worm, decay, nutrient, holding,
    speed, speedModifier,
    updateDelayW, direction, new_direction;

const SQUARESIZE = 15;

var wormState = {

    create: function () {

        if (!game.device.desktop) {
            this.addMobileInputs();
        }

        // Arrow and space keys
        this.cursor = game.input.keyboard.createCursorKeys();
        this.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Define roots
        this.roots = [];

        // Add map 
        this.createWorld();

        // Score labels
        this.wScoreLabel = game.add.text(game.width - 12, game.height - 10, 'trees planted: 0', {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.wScoreLabel.anchor.setTo(1, 1);

        this.devoured = 0;
        decayDevoured = game.add.text(game.width / 2, game.height - 10, 'decay devoured: ' + this.devoured, {
            font: '16px Arial',
            fill: '#ffffff'
        });
        decayDevoured.anchor.setTo(0.5, 1);

        this.delivered = 0;
        nutrientsDelivered = game.add.text(12, game.height - 10, 'nutrients delivered: ' + this.delivered, {
            font: '16px Arial',
            fill: '#ffffff'
        });
        nutrientsDelivered.anchor.setTo(0, 1);

        worm = []; // This will work as a stack, containing the parts of our worm
        decay = []; // An array for the decay.
        nutrient = []; // An array for deposited nutrients.
        holding = 0; // A counter for how much the worm is carrying at a given time. 
        speed = 0; // Game speed.
        speedModifier = 0; // Number of times collided with self or wall.        
        updateDelayW = 0; // A variable for control over update rates.
        direction = 'right'; // The direction of our worm.
        new_direction = null; // A buffer to store the new direction into.

        // Add sprites to the game.
        this.goal = game.add.sprite(game.width / 2, 0, 'goal');
        this.goal.anchor.setTo(0.5, 0);

        for (var i = 0; i < 10; i++) {
            worm[i] = game.add.sprite(150 + i * SQUARESIZE, 150, 'wormsquare');
        }

        // Enable overlap physics.
        game.physics.arcade.enable(worm, Phaser.Physics.ARCADE);
        game.physics.arcade.enable(this.goal, Phaser.Physics.ARCADE);

        // Genereate the first three pieces of decay.
        this.newDecay(3);

        // The arrow keys and spacebar will only ever affect the game, not the browswer window.
        game.input.keyboard.addKeyCapture(
            [Phaser.Keyboard.UP, Phaser.Keyboard.DOWN,
             Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
             Phaser.Keyboard.SPACEBAR]);

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

        game.input.onDown.add(this.makeTrue, this);
    },

    update: function () {
        //This is meant to allow a nutrient to be dropped only on a mouse-click. 
        if (!game.input.activePointer.leftButton.isDown) {
            this.makeFalse();
            wasCalled = false;
        }

        // Is the worm over the goal? 
        game.physics.arcade.overlap(worm[0], this.goal, this.depositNutrient, null, this);

        var firstCell = worm[worm.length - 1];

        // Use the arrow keys to determine the worm's new direction, while preventing illegal directions.
        if (this.cursor.right.isDown && direction != 'left' && firstCell.x < (game.width - SQUARESIZE)) {
            new_direction = 'right';
        } else if (this.cursor.left.isDown && direction != 'right' && firstCell.x > SQUARESIZE) {
            new_direction = 'left';
        } else if (this.cursor.up.isDown && direction != 'down' && firstCell.y > 0) {
            new_direction = 'up';
        } else if (this.cursor.down.isDown && direction != 'up' && firstCell.y < (game.height - SQUARESIZE)) {
            new_direction = 'down';
        }

        speedModifier = Math.min(10, speedModifier); // Set the collision counter to at most 10.
        speed = Math.min(10, speedModifier); // Modulate speed based on the collision counter.

        // Run this code every 10 (to 20) runs through "update," unless sped up.
        updateDelayW++;
        if (updateDelayW % (10 + speed) == 0) {
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
            speedModifier++;
            console.log(speedModifier);
        } else if (direction == 'left' && head.x == 0) {
            new_direction = 'down';
            speedModifier++;
            console.log(speedModifier);
        } else if (direction == 'up' && head.y == 0) {
            new_direction = 'left';
            speedModifier++;
            console.log(speedModifier);
        } else if (direction == 'down' && head.y == (game.height - SQUARESIZE)) {
            new_direction = 'right';
            speedModifier++;
            console.log(speedModifier);
        }
    },

    selfCollision: function (head) {
        // Check if the head of the worm overlaps with any part of the worm.
        for (var i = 0; i < worm.length - 1; i++) {
            if (head.x == worm[i].x && head.y == worm[i].y) {
                speedModifier++;
                console.log(speedModifier);
            }
        }
    },

    rootCollision: function (head) {
        // Check if the head of the worm overlaps with any roots.
        for (var i = 0; i < this.roots.length - 1; i++) {
            if (head.x == this.roots[i].x && head.y == this.roots[i].y) {
                speedModifier++;
                console.log(speedModifier);
            }
        }
    },

    newDecay: function (number) {
        for (i = 0; i < number; i++) {
            // Choose a random place on the grid.
            var randomX = (Math.floor(Math.random() * 38) * SQUARESIZE) + SQUARESIZE,
                randomY = (Math.floor(Math.random() * 21) * SQUARESIZE) + SQUARESIZE;

            // Add a new decay.
            decay[decay.length] = game.add.sprite(randomX, randomY, 'decay');

        }
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
                    console.log("Holding " + holding);

                    // Reduce the counter / speed up the worm.
                    if (speedModifier > -8) {
                        speedModifier -= 2;
                        console.log(speedModifier);
                    }
                    // Increase the devoured variable by 1
                    this.devoured++;
                    this.updateDevoured(this.devoured);
                }
            }
        }
    },

    makeTrue: function () {
        isClicked = true;
    },

    makeFalse: function () {
        isClicked = false;
    },

    depositNutrient: function () {
        x = worm[0].x;
        y = worm[0].y;

        if (isClicked == true && holding > 0) {
            holding--;
            console.log("Now holding " + holding);

            nutrient[nutrient.length] = game.add.sprite(x, y, 'nutrient');
            Client.sendNutrient();
            this.delivered++;
            this.updateDelivered(this.delivered);

            isClicked = false;
            speedModifier += 2; // Slow down for every nutrient depositied
        }
    },

    //    eraseNutrient: function () {
    //        console.log(this.nutrientArray.length);
    //        //console.log("A nutrient is erased.");
    //
    //        which = birdState.getRandomInt(0, this.nutrientArray.length);
    //        this.nutrientArray.splice(which - 1, 1);
    //
    //        console.log(this.nutrientArray.length);
    //    },

    createWorld: function () {
        game.add.image(0, 0, 'wormBG');
        this.drawRoot();

        //        this.map = game.add.tilemap('dmap');
        //        this.map.addTilesetImage('tiles');
        //        this.layer = this.map.createLayer('Tile Layer 1');

        //        this.layer.resizeWorld();

        //        // Enable collisions for the XX'th tilset elements (dark worm, roots, worms)
        //        this.map.setCollision();
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
            this.wScoreLabel.setText('trees planted: ' + wScore);
        }
    },

    updateDevoured: function (devoured) {
        decayDevoured.setText('decay devoured: ' + devoured);
    },

    updateDelivered: function (delivered) {
        nutrientsDelivered.setText('nutrients delivered: ' + delivered);
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
