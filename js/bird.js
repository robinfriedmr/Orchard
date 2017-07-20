var wasCalledB = false;
var appleEaten = false;

var flip = true;

var birdState = {

    create: function () {

        // Add inputs.
        this.cursor = game.input.keyboard.createCursorKeys();
        this.debugAppleDrop = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.poopButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.wasCalledToggle = game.input.keyboard.addKey(Phaser.Keyboard.R);

        // Create object for fallingApple so that it's defined.
        this.fallingApple = {};

        // Add background. 
        this.createWorld();

        // Add score label.
        birdState.bScoreLabel = game.add.text(50, 30, 'trees planted: 0', {
            font: '24px Arial',
            fill: '#ffffff'
        });

        // Add pooped seed emitter.
        this.emitter = game.add.emitter(55, 55, 10);
        this.emitter.makeParticles('seeds');
        this.emitter.gravity = 555;

        // Add sprites to the game.
        this.birdplayer = game.add.sprite(game.width / 2 + 200, game.height / 3, 'bird');
        this.birdplayer.frame = 1;
        this.birdplayer.anchor.setTo(0.5, 0.5);

        // Enable physics on the sprites' bodies.
        game.physics.arcade.enable(this.birdplayer, Phaser.Physics.ARCADE);
        this.birdplayer.body.gravity.y = 1000;
        this.birdplayer.body.collideWorldBounds = true;

        // The arrow keys will only ever affect the game, not the browswer window.
        game.input.keyboard.addKeyCapture(
            [Phaser.Keyboard.UP, Phaser.Keyboard.DOWN,
             Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
             Phaser.Keyboard.SPACEBAR]);

        // If the device is mobile, also execute these:
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

            this.addMobileInputs();
        }
    },

    update: function () {

        game.physics.arcade.overlap(this.birdplayer, this.fallingApple, this.eatApple, null, this);

        // For debug.
        if (this.wasCalledToggle.isDown && wasCalledB == true) {
            wasCalledB = false; // Toggle wasCalled back to false.
            console.log("wasCalled is now " + wasCalledB);
        }
        this.debugDrop();

        // Change angle of bird to encourage flapping.
        if (this.birdplayer.scale.x == -1) {
            if (this.birdplayer.angle > -20) {
                this.birdplayer.angle -= 1;
            }
        } else if (this.birdplayer.scale.x == 1) {
            if (this.birdplayer.angle < 20) {
                this.birdplayer.angle += 1;
            }
        }

        // Destroy the apple if it's still alive but out of range.
        if (this.fallingApple.alive == true) {
            if (this.fallingApple.y > game.height + 40) {
                this.destroyFallenApple();
            }
        }

        this.propagate();
        this.movePlayer();
    },

    destroyFallenApple: function () {
        this.fallingApple.alive = false;
        this.fallingApple.destroy();

        Client.sendDecay(1);
        Client.sendDecay();
    },

    appleDrop: function () {
        console.log("An apple is dropped.");
        this.fallingApple = game.add.sprite(this.getRandomInt(50, game.width - 50), 0, 'growingapple');
        this.fallingApple.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.fallingApple, Phaser.Physics.ARCADE);
        this.fallingApple.body.setCircle(37.5);
        this.fallingApple.body.velocity.y = 10;
        this.fallingApple.tint = 0xE60C0C;
    },

    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    },

    eatApple: function () {
        if (appleEaten == false) {
            this.fallingApple.destroy();
            this.birdplayer.frame = 0;
            console.log("The apple is eaten");
            appleEaten = true;
        }
    },

    propagate: function () {
        if (appleEaten == true) {
            if (this.poopButton.isDown) {
                this.dump(this.birdplayer.x, this.birdplayer.y);
            }
        }
    },

    dump: function (x, y) {
        this.birdplayer.frame = 1;
        appleEaten = false;

        this.emitter.x = x;
        this.emitter.y = y + 50;

        this.emitter.start(true, 1000, null, 10);

        Client.sendDecay(5);
        Client.sendDecay();
        Client.sendDecay();
        Client.sendDecay();
        Client.sendDecay();
        Client.sendDecay();
        Client.sendSeed(this.birdplayer.x);
    },

    plantSeed: function (seedX) {
        game.add.image(seedX, game.height - 25, 'nutrient');
    },

    updateScore: function (bScore) {
        if (birdState.bScoreLabel) {
            birdState.bScoreLabel.setText('trees planted: ' + bScore);
        }
    },

    jump: function () {
        this.birdplayer.body.velocity.y = -350;

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
        if (this.cursor.left.isUp && this.cursor.right.isUp) {
            flip = true;
        }

        // Moving conditions
        if (flip) {
            if (this.cursor.left.isDown) {
                this.birdplayer.body.velocity.x = -350;
                this.jump();

                if (this.birdplayer.scale.x == 1) {
                    this.birdplayer.scale.x = -1;
                }
                flip = false;

            } else if (this.cursor.right.isDown) {
                this.birdplayer.body.velocity.x = 350;
                this.jump();

                if (this.birdplayer.scale.x == -1) {
                    this.birdplayer.scale.x = 1;
                }
                flip = false;

            } else {
                // Stop the player
                this.birdplayer.body.velocity.x = 0;

                if (this.birdplayer.body.onFloor() || this.birdplayer.body.touching.down) {
                    game.add.tween(this.birdplayer).to({
                        angle: 0
                    }, 100).start();
                }
            }
        }
    },

    startMenu: function () {
        game.state.start('menu');
    },

    debugDrop: function () {
        if (!wasCalledB && this.debugAppleDrop.isDown && appleEaten == false) {
            wasCalledB = true;
            console.log("wasCalled is now " + wasCalledB);
            this.appleDrop();
        }
    },


    // ****************** MOBILE FUNCTIONS *****************
    addMobileInputs: function () {

        // this.bg.events.onInputDown.add(this.jump, this);

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
