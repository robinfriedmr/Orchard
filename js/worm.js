// Worm 6/30/2017 13:21

// This game is an amalgamation of original code, code inspired by the Discover Phaser tutorial, and Danny Markov's "Making Your First HTML5 Game With Phaser" tutorial on tutorialzine.com.

var wasCalled = false; // this is a variable temporarily needed to get the overlap with goal function tested. 

var worm, decay, nutrient,
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

        // Add map 
        this.createWorld();

        wormState.wScoreLabel = game.add.text(50, 30, 'trees planted: 0', {
            font: '24px Arial',
            fill: '#ffffff'
        });

        worm = []; // This will work as a stack, containing the parts of our worm
        decay = []; // An array for the decay.
        nutrient = []; // An array for the nutrient.
        speed = 0; // Game speed.
        collisionCounter = 0; // Number of times collided with self or wall.
        updateDelayW = 0; // A variable for control over update rates.
        direction = 'right'; // The direction of our worm.
        new_direction = null; // A buffer to store the new direction into.

        // Add sprites to the game
        for (var i = 0; i < 10; i++) {
            worm[i] = game.add.sprite(150 + i * SQUARESIZE, 150, 'wormsquare');
        }

        // Genereate the first three pieces of decay.
        this.newDecay(3);
        console.log(decay.length);

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

    },

    update: function () {

        // Use the arrow keys to determine the worm's new direction, while preventing illegal directions.
        if (this.cursor.right.isDown && direction != 'left') {
            new_direction = 'right';
        } else if (this.cursor.left.isDown && direction != 'right') {
            new_direction = 'left';
        } else if (this.cursor.up.isDown && direction != 'down') {
            new_direction = 'up';
        } else if (this.cursor.down.isDown && direction != 'up') {
            new_direction = 'down';
        }

        collisionCounter = Math.min(10, collisionCounter); // Set the collision counter to at most 10.
        speed = Math.min(10, collisionCounter); // Modulate speed based on the collision counter.

        // Run this code every 10 (to 20) runs through "update"
        updateDelayW++;
        if (updateDelayW % (10 + speed) == 0) {
            // Worm movement
            var firstCell = worm[worm.length - 1],
                lastCell = worm.shift(),
                oldLastCellx = lastCell.x,
                oldLastCelly = lastCell.y;

            // Check for collisions. Parameter is the head of the worm.
            this.wallCollision(firstCell);
            this.selfCollision(firstCell);
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

    newDecay: function (number) {
        for (i = 0; i < number; i++) {
            // Choose a random place on the grid.
            var randomX = (Math.floor(Math.random() * 38) * SQUARESIZE) + SQUARESIZE,
                randomY = (Math.floor(Math.random() * 21) * SQUARESIZE) + SQUARESIZE;

            // Add a new decay.
            decaySprite = game.add.sprite(randomX, randomY, 'decay');
            decay.push(decaySprite);
        }
    },

    decayCollision: function (firstCell) {
        // Check if the head is colliding with the decay. (Changed from a for loop into just the head.) 
        if (firstCell.x == decaySprite.x && firstCell.y == decaySprite.y) {

            // Destroy the old decay.
            // *** NEEDS TO BE REMOVED FROM ARRAY AS WELL ***
            decaySprite.destroy();

            // Send a nutrient to the server.
            Client.sendNutrient();

            if (collisionCounter > 0) {
                collisionCounter--;
                console.log(collisionCounter);
            }

            console.log(decay.length);
        }
    },

    eraseNutrient: function () {
        console.log(this.nutrientArray.length);
        //console.log("A nutrient is erased.");

        which = birdState.getRandomInt(0, this.nutrientArray.length);
        this.nutrientArray.splice(which - 1, 1);

        console.log(this.nutrientArray.length);
    },

    createWorld: function () {
        game.add.image(0, 0, 'wormBG');

        //        this.map = game.add.tilemap('dmap');
        //        this.map.addTilesetImage('tiles');
        //        this.layer = this.map.createLayer('Tile Layer 1');

        //        this.layer.resizeWorld();

        //        // Enable collisions for the XX'th tilset elements (dark worm, roots, worms)
        //        this.map.setCollision();
    },

    updateScore: function (wScore) {
        if (wormState.wScoreLabel) {
            wormState.wScoreLabel.setText('trees planted: ' + wScore);
        }
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
