// Worm 6/30/2017 13:21

// This game is an amalgamation of original code, code inspired by the Discover Phaser tutorial, and Danny Markov's "Making Your First HTML5 Game With Phaser" tutorial on tutorialzine.com.

var wasCalled = false; // this is a variable temporarily needed to get the overlap with goal function tested. 

var worm, apple, nutrient,
    squareSize, speed, collisionCounter,
    updateDelay, direction, new_direction;

var wormState = {

    create: function () {

        if (!game.device.desktop) {
            this.addMobileInputs();
        }

        // Arrow and WASD keys
        this.cursor = game.input.keyboard.createCursorKeys();
        this.wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };
        this.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Add map 
        this.createWorld();

        wormState.wScoreLabel = game.add.text(50, 30, 'trees planted: 0', {
            font: '24px Arial',
            fill: '#ffffff'
        });

        worm = []; // This will work as a stack, containing the parts of our worm
        apple = {}; // An object for the apple;
        nutrient = {}; // An object for the nutrient***.
        squareSize = 15; // The length of a side of the squares. Our image is 15x15 pixels.
        speed = 0; // Game speed.
        collisionCounter = 0; // Number of times collided with self or wall.
        updateDelay = 0; // A variable for control over update rates.
        direction = 'right'; // The direction of our worm.
        new_direction = null; // A buffer to store the new direction into.

        // Add sprites to the game
        for (var i = 0; i < 10; i++) {
            worm[i] = game.add.sprite(150 + i * squareSize, 150, 'wormsquare');
        }

        // Genereate the first apple.
        this.generateApple();

        // The arrow keys will only ever affect the game, not the browswer window.
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
        // Collisions should always go at the top of the Update function.

        // Use the arrow keys to determine the new direction, while preventing illegal directions.
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
        updateDelay++;
        if (updateDelay % (10 + speed) == 0) {
            // Worm movement
            var firstCell = worm[worm.length - 1],
                lastCell = worm.shift(),
                oldLastCellx = lastCell.x,
                oldLastCelly = lastCell.y;

            // Check for collision with wall. Parameter is the head of the worm. ***TRYING TO GET THIS TO ACTUALLY MAKE THE WORM CHANGE DIRECTION. ***
            this.wallCollision(firstCell);

            // Check for apple collision.
            this.appleCollision();
            // Check for collision with self. Parameter is the head of the worm.
            this.selfCollision(firstCell);

            // If a new direction has been chosen from the keyboard, make it the direction of the worm now.
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
            lastCell.x = firstCell.x + squareSize;
            lastCell.y = firstCell.y;
        } else if (direction == 'left') {
            lastCell.x = firstCell.x - squareSize;
            lastCell.y = firstCell.y;
        } else if (direction == 'up') {
            lastCell.x = firstCell.x;
            lastCell.y = firstCell.y - squareSize;
        } else if (direction == 'down') {
            lastCell.x = firstCell.x;
            lastCell.y = firstCell.y + squareSize;
        }
        worm.push(lastCell); // Place the last cell in the front of the stack.
        firstCell = lastCell; // Mark it the first cell.
    },

    wallCollision: function (head) {        
        if (direction == 'right' && head.x == (game.width - squareSize)) {
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
        } else if (direction == 'down' && head.y == (game.height - squareSize)) {
            new_direction = 'right';
            collisionCounter++;
            console.log(collisionCounter);
        }
    },


    generateApple: function () {
        // Chose a random place on the grid.
        var randomX = (Math.floor(Math.random() * 37) * squareSize) + squareSize,
            randomY = (Math.floor(Math.random() * 20) * squareSize) + squareSize;

        // Add a new apple.
        apple = game.add.sprite(randomX, randomY, 'applesquare');
    },

    appleCollision: function () {

        // Check if any part of the worm is overlapping the apple.
        for (var i = 0; i < worm.length; i++) {
            if (worm[i].x == apple.x && worm[i].y == apple.y) {

                // Put in a nutrient where the apple is.
                game.add.sprite(apple.x, apple.y, 'nutrient');
                // Send a nutrient to the server.
                Client.sendNutrient();

                // Destroy the old apple.
                apple.destroy();
                // Make a new one.
                this.generateApple();

                if (collisionCounter > 0) {
                    collisionCounter--;
                    console.log(collisionCounter);
                }
            }
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

    createWorld: function () {
        game.add.image(0, 0, 'wormBG');

        //        // Create the tilemap
        //        this.map = game.add.tilemap('dmap');
        //        // Add the tileset to the map
        //        this.map.addTilesetImage('tiles');
        //        // Create the layer by specifying the name of the Tiled layer
        //        this.layer = this.map.createLayer('Tile Layer 1');
        //
        //        // Set the world size to match the size of the layer
        //        this.layer.resizeWorld();
        //        // Enable collisions for the XX'th tilset elements (dark worm, roots, worms)
        //        this.map.setCollision();
    },

    updateScore: function (wScore) {
        if (wormState.wScoreLabel) {
            wormState.wScoreLabel.setText('trees planted: ' + wScore);
        }
    },


    //    movePlayer: function () {
    //        // If 0 fingers are touching the screen
    //        if (game.input.totalActivePointers == 0) {
    //            // Make sure the player is not moving
    //            this.moveLeft = false;
    //            this.moveRight = false;
    //        }
    //
    //        // Moving conditions
    //        if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
    //            this.wormplayer.body.velocity.x = -200;
    //            this.checkLoc();
    //        } else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
    //            this.wormplayer.body.velocity.x = 200;
    //            this.checkLoc();
    //        } else if (this.cursor.down.isDown || this.wasd.down.isDown || this.moveDown) {
    //            this.wormplayer.body.velocity.y = 200;
    //            this.checkLoc();
    //        } else if (this.cursor.up.isDown || this.wasd.up.isDown || this.moveUp) {
    //            this.wormplayer.body.velocity.y = -200;
    //            this.checkLoc();
    //        } else {
    //            // Stop the player
    //            this.wormplayer.body.velocity.x = 0;
    //            this.wormplayer.body.velocity.y = 0;
    //            //this.wormplayer.animations.stop(); //Cease any animation
    //            //this.wormplayer.frame = 0; // Change frame (to stand still)
    //        }
    //    },

    //    startMenu: function () {
    //        game.state.start('menu');
    //    },

    // ****************** MOBILE FUNCTIONS *****************
    //    addMobileInputs: function () {
    //        // Add the jump button
    //        //        var jumpButton = game.add.sprite(350, 240, 'jumpButton');
    //        //        jumpButton.inputEnabled = true;
    //        //        jumpButton.alpha = 0.5;
    //        //        // Call 'jumpPlayer' when the 'jumpButton' is pressed
    //        //        jumpButton.events.onInputDown.add(this.jumpPlayer, this);
    //
    //        this.moveLeft = false;
    //        this.moveRight = false;
    //
    //        // Add the move left button
    //        var leftButton = game.add.sprite(50, 240, 'leftButton');
    //        leftButton.inputEnabled = true;
    //        leftButton.alpha = 0.5;
    //        // If the curser is Over or Down on this sprite, set moveLeft to true. 
    //        leftButton.events.onInputOver.add(this.setLeftTrue, this);
    //        leftButton.events.onInputOut.add(this.setLeftFalse, this);
    //        leftButton.events.onInputDown.add(this.setLeftTrue, this);
    //        leftButton.events.onInputUp.add(this.setLeftFalse, this);
    //
    //
    //        // Add the move right button
    //        var rightButton = game.add.sprite(130, 240, 'rightButton');
    //        rightButton.inputEnabled = true;
    //        rightButton.alpha = 0.5;
    //        rightButton.events.onInputOver.add(this.setRightTrue, this);
    //        rightButton.events.onInputOut.add(this.setRightFalse, this);
    //        rightButton.events.onInputDown.add(this.setRightTrue, this);
    //        rightButton.events.onInputUp.add(this.setRightFalse, this);
    //
    //    },
    //
    //    // This set of functions relates to the mobile input buttons.
    //    setLeftTrue: function () {
    //        this.moveLeft = true;
    //    },
    //    setLeftFalse: function () {
    //        this.moveLeft = false;
    //    },
    //    setRightTrue: function () {
    //        this.moveRight = true;
    //    },
    //    setRightFalse: function () {
    //        this.moveRight = false;
    //    },
    //
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
    //
    //    render: function () {
    //        // Sprite debug info, including location information. 
    //        game.debug.spriteCoords(this.wormplayer, 50, game.height - 100);
    //    },

};
