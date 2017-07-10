var wasCalledB = false;
var appleEaten = false;

var birdState = {

    create: function () {

        this.cursor = game.input.keyboard.createCursorKeys();

        this.debugAppleDrop = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.poopButton = game.input.keyboard.addKey(Phaser.Keyboard.P);
        this.wasCalledToggle = game.input.keyboard.addKey(Phaser.Keyboard.R);

        this.fallingApple = {};

        // Pooped seed emitter
        this.emitter = game.add.emitter(0, 0, 8);
        this.emitter.makeParticles('seeds');
        this.emitter.gravity = 500;


        // Add background and map (eventually) 
        this.createWorld();

        // Add sprites to the game
        this.birdplayer = game.add.sprite(game.width / 2 + 200, game.height / 3, 'bird');
        this.birdplayer.anchor.setTo(0.5, 0.5);

        // Enable physics on the sprites' bodies.
        game.physics.arcade.enable(this.birdplayer, Phaser.Physics.ARCADE);
        this.birdplayer.body.gravity.y = 1000;
        this.birdplayer.body.collideWorldBounds = true;

        // When the mouse is clicked or the screen is tapped, play jump.
        // this.bg.events.onInputDown.add(this.jump, this);

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
        game.physics.arcade.overlap(this.birdplayer, this.fallingApple, this.eatApple, null, this);

        if (this.wasCalledToggle.isDown && wasCalled == true) {
            wasCalled = false; // Toggle wasCalled back to false.
            console.log("wasCalled is now " + wasCalled);
        }

        if (this.birdplayer.scale.x == -1) {
            if (this.birdplayer.angle > -20) {
                this.birdplayer.angle -= 1;
            }
        } else if (this.birdplayer.scale.x == 1) {
            if (this.birdplayer.angle < 20) {
                this.birdplayer.angle += 1;
            }
        }

        this.debugDrop();
        this.propagate(); // call this continuously to check if it's true.
        this.movePlayer();
        
        console.log(this.emitter.on); // **************
    },

    appleDrop: function () {
        console.log("An apple is dropped.");
        this.fallingApple = game.add.sprite(game.width / 2, 0, 'growingapple');
        game.physics.arcade.enable(this.fallingApple, Phaser.Physics.ARCADE);
    },

    eatApple: function () {
        if (appleEaten == false) {
            this.fallingApple.destroy();
            console.log("The apple is eaten");
            appleEaten = true;
        }
    },

    propagate: function () {
        if (appleEaten == true) {
            console.log("We must poop the apple seeds!");

            if (this.poopButton.isDown && this.birdplayer.x > game.width - 200) {
                console.log("Player is on the right side of the screen and the poopButton is pressed.");
                appleEaten = false;
                this.dump(this.birdplayer.x, this.birdplayer.y);
            }
        }
    },

    dump: function (x, y) {
        this.emitter.x = x;
        this.emitter.y = y;
        this.emitter.start(true, 1000, null);

        console.log(this.emitter.x + ", " + this.emitter.y + " is the emitter.");
        console.log(this.emitter.on); // this is returning false?
    },

    debugDrop: function () {
        if (!wasCalled && this.debugAppleDrop.isDown && appleEaten == false) {
            wasCalled = true;
            console.log("wasCalled is now " + wasCalled);
            this.appleDrop();
        }
    },

    jump: function () {
        this.birdplayer.body.velocity.y = -200;

        if (this.birdplayer.scale.x == -1) {
            game.add.tween(this.birdplayer).to({
                angle: 20
            }, 100).start();
        } else if (this.birdplayer.scale.x == 1) {
            game.add.tween(this.birdplayer).to({
                angle: -20
            }, 100).start();
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
        this.bg = game.add.image(0, 0, 'birdBG');
        this.bg.inputEnabled = true; // allow the click/tap event to actually do something

        game.physics.arcade.gravity.y = 500; //world gravity

    },

    movePlayer: function () {
        //        // If 0 fingers are touching the screen
        //        if (game.input.totalActivePointers == 0) {
        //            // Make sure the player is not moving
        //            this.moveLeft = false;
        //            this.moveRight = false;
        //        }

        // Moving conditions
        if (this.cursor.left.isDown) {
            this.birdplayer.body.velocity.x = -200;
            this.jump();

            if (this.birdplayer.scale.x == 1) {
                this.birdplayer.scale.x = -1;
            }

        } else if (this.cursor.right.isDown) {
            this.birdplayer.body.velocity.x = 200;
            this.jump();

            if (this.birdplayer.scale.x == -1) {
                this.birdplayer.scale.x = 1;
            }

        } else if (this.cursor.up.isDown) {
            this.jump();
        } else {
            // Stop the player
            this.birdplayer.body.velocity.x = 0;

            if (this.birdplayer.body.onFloor() || this.birdplayer.body.touching.down) {
                game.add.tween(this.birdplayer).to({
                    angle: 0
                }, 100).start();
            }

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
