var sunState = {

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

        // Add background and map (eventually) 
        this.createWorld();

        // Add sprites to the game
        this.sunplayer = game.add.sprite(game.width / 2 + 200, game.height / 2, 'sunplayer');

        //Enable physics on the sprites' bodies.
        game.physics.arcade.enable(this.sunplayer);

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

        // *** This is an attempt to change the camera's view. ***
        //Phaser.Camera = function (game, 0, 0, 12*25, 7*25) { }  
        //this.view = new Phaser.Rectangle(0, 0, 12*25, 7*25);
        //game.camera.width = 12 * 25;
        //game.camera.height = 7 * 25;
    },

    update: function () {
        // Collisions should always go at the top of the Update function.
        //        game.physics.arcade.collide(this.nutrient, this.player, this.pullNutrient, this.spaceCheck, this);
        //        game.physics.arcade.overlap(this.nutrient, this.goal, this.goalAchieved, null, this);


        // If the player is dead, do nothing.
        if (!this.sunplayer.alive) {
            return;
        }
        this.movePlayer();
    },

    spaceCheck: function () {
        if (this.spacebar.isDown) {
            return true;
            console.log("Spacebar down is true.")
        } else {
            return false;
        }
    },

    createWorld: function () {

        //        // Create the tilemap
        //        this.map = game.add.tilemap('map');
        //        // Add the tileset to the map
        //        this.map.addTilesetImage('tiles');
        //        // Create the layer by specifying the name of the Tiled layer
        //        this.layer = this.map.createLayer('Tile Layer 1');

        //        // Set the world size to match the size of the layer
        //        this.layer.resizeWorld();
        //        // Enable collisions for the first tilset element (the blue wall)
        //        this.map.setCollision([3, 4]);
        game.add.image(0, 0, 'sunBG');
    },

    movePlayer: function () {
        // If 0 fingers are touching the screen
        if (game.input.totalActivePointers == 0) {
            // Make sure the player is not moving
            this.moveLeft = false;
            this.moveRight = false;
        }

        // Moving conditions
        if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
            this.sunplayer.body.velocity.x = -200;
        } else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
            this.sunplayer.body.velocity.x = 200;
        } else if (this.cursor.down.isDown || this.wasd.down.isDown || this.moveDown) {
            this.sunplayer.body.velocity.y = 200;
        } else if (this.cursor.up.isDown || this.wasd.up.isDown || this.moveUp) {
            this.sunplayer.body.velocity.y = -200;
        } else {
            // Stop the player
            this.sunplayer.body.velocity.x = 0;
            this.sunplayer.body.velocity.y = 0;
            //this.player.animations.stop(); //Cease any animation
            //this.player.frame = 0; // Change frame (to stand still)
        }
    },

    startMenu: function () {
        game.state.start('menu');
    },

    // ****************** MOBILE FUNCTIONS *****************
    addMobileInputs: function () {
//        // Add the jump button
//        var jumpButton = game.add.sprite(350, 240, 'jumpButton');
//        jumpButton.inputEnabled = true;
//        jumpButton.alpha = 0.5;
//        // Call 'jumpPlayer' when the 'jumpButton' is pressed
//        jumpButton.events.onInputDown.add(this.jumpPlayer, this);

        this.moveLeft = false;
        this.moveRight = false;

        // Add the move left button
        var leftButton = game.add.sprite(50, 240, 'leftButton');
        leftButton.inputEnabled = true;
        leftButton.alpha = 0.5;
        // If the curser is Over or Down on this sprite, set moveLeft to true. 
        leftButton.events.onInputOver.add(this.setLeftTrue, this);
        leftButton.events.onInputOut.add(this.setLeftFalse, this);
        leftButton.events.onInputDown.add(this.setLeftTrue, this);
        leftButton.events.onInputUp.add(this.setLeftFalse, this);


        // Add the move right button
        var rightButton = game.add.sprite(130, 240, 'rightButton');
        rightButton.inputEnabled = true;
        rightButton.alpha = 0.5;
        rightButton.events.onInputOver.add(this.setRightTrue, this);
        rightButton.events.onInputOut.add(this.setRightFalse, this);
        rightButton.events.onInputDown.add(this.setRightTrue, this);
        rightButton.events.onInputUp.add(this.setRightFalse, this);

    },

    // This set of functions relates to the mobile input buttons.
    setLeftTrue: function () {
        this.moveLeft = true;
    },
    setLeftFalse: function () {
        this.moveLeft = false;
    },
    setRightTrue: function () {
        this.moveRight = true;
    },
    setRightFalse: function () {
        this.moveRight = false;
    },

    orientationChange: function () {
        // If the game is in portrait (wrong orientation)
        if (game.scale.isPortrait) {
            // Pause the game and add a text explanation
            game.paused = true;
            this.rotateLabel.text = 'Rotate to landscape';
        }
        // If the game is in landscape (good orientation)
        else {
            // Resume the game and remove the text
            game.paused = false;
            this.rotateLabel.text = '';
        }
    },

};
