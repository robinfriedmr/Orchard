// Worm 6/30/2017 13:21

// This game is an amalgamation of original code, code inspired by the Discover Phaser tutorial, and Danny Markov's "Making Your First HTML5 Game With Phaser" tutorial on tutorialzine.com.

var isClicked = false; // this is a variable temporarily needed to get the overlap with goal function tested. 

var worm, decay, nutrient, holding,
    speed, collisionCounter,
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
        collisionCounter = 0; // Number of times collided with self or wall.        
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

        collisionCounter = Math.min(10, collisionCounter); // Set the collision counter to at most 10.
        speed = Math.min(10, collisionCounter); // Modulate speed based on the collision counter.

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
            collisionCounter++;
            console.log(collisionCounter);
        } else if (direction == 'left' && head.x == 0) {
            new_direction = 'down';
            collisionCounter++;
            console.log(collisionCounter);
        } else if (direction == 'up' && head.y == 0) {
            new_direction = 'left';
            collisionCounter++;
            console.log(collisionCounter);
        } else if (direction == 'down' && head.y == (game.height - SQUARESIZE)) {
            new_direction = 'right';
            collisionCounter++;
            console.log(collisionCounter);
        }
    },

    selfCollision: function (head) {
        // Check if the head of the worm overlaps with any part of the worm.
        for (var i = 0; i < worm.length - 1; i++) {
            if (head.x == worm[i].x && head.y == worm[i].y) {
                collisionCounter++;
                console.log(collisionCounter);
            }
        }
    },

    rootCollision: function (head) {
        // Check if the head of the worm overlaps with any roots.
        for (var i = 0; i < this.roots.length - 1; i++) {
            if (head.x == this.roots[i].x && head.y == this.roots[i].y) {
                collisionCounter++;
                console.log(collisionCounter);
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

                    // Send a nutrient to the server.
                    Client.sendNutrient();
                    holding++; // How many nutrients are we holding?
                    console.log("Holding " + holding);

                    // Reduce the counter / speed up the worm.
                    if (collisionCounter > -3) {
                        collisionCounter--;
                        console.log(collisionCounter);
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
            this.delivered++;
            this.updateDelivered(this.delivered);

            isClicked = false;
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

        // *** CREATE OBSTACLES

        //        this.map = game.add.tilemap('dmap');
        //        this.map.addTilesetImage('tiles');
        //        this.layer = this.map.createLayer('Tile Layer 1');

        //        this.layer.resizeWorld();

        //        // Enable collisions for the XX'th tilset elements (dark worm, roots, worms)
        //        this.map.setCollision();
    },

    drawRoot: function () {

    var whichSpot = birdState.getRandomInt(0, 10);

        if (whichSpot <= 1) {
            here = 'left';
        } else if (whichSpot >= 8) {
            here = 'right';
        } else {
            here = 'top';
        }

        switch (here) {
            case 'left':
                console.log("left");

                var prob = 0.15;
                var rootX = 0;
                var rootY = 195;

                this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');

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

                var prob = 0.15;
                var rootX = game.width - SQUARESIZE;
                var rootY = 195;

                this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root');

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
                var prob = 0.05;
                var rootX = 30; // This will need to be a variable number that changes as the game is played.
                var rootY = 0;

                this.roots[this.roots.length] = game.add.sprite(rootX, rootY, 'root'); // Put down the first block.

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
