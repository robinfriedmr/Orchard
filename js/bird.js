var wasCalledB = false;
var appleEaten = false;

var flip = true;

var trashArray = [];

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
        this.birdplayer.body.setSize(40, 55)
        this.birdplayer.body.collideWorldBounds = true;
        this.birdplayer.body.checkCollision.down = false;

        this.makeTrash();

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
        game.physics.arcade.collide([this.birdplayer, this.trash], [this.trash, this.platforms]);

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
        //if (this.birdplayer.body.onFloor()) { // boolean that evaluates if the bird player is on the bottom of the world

        this.birdplayer.frame = 1;
        appleEaten = false;

        this.emitter.x = x;
        this.emitter.y = y + 50;

        this.emitter.start(true, 1000, null, 10);

        //        if (Math.abs(this.emitter.x - .x) > .width) {
        Client.sendSeed(this.birdplayer.x); // Ask the server to plant a seed
        for (i = 0; i < 5; i++) { // Send five pieces of decay per seed planted
            Client.sendDecay();
        }
        //            }

        //}
    },

    plantSeed: function (seedX) {
        game.add.image(seedX, game.height - 15, 'nutrient');
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
        this.bg = game.add.image(0, 0, 'birdBG');

        this.platforms = this.add.physicsGroup(); // Create physics group for the ground. A physicsGroup has a physics body enabled by default. 

        // Create the ground and set properties.
        this.platforms.create(0, game.height - 5, 'ground');
        this.platforms.setAll('body.allowGravity', false);
        this.platforms.setAll('body.immovable', true);
        this.platforms.setAll('body.moves', false);
        this.platforms.setAll('body.velocity.x', 100);
        this.platforms.setAll('body.friction.x', 1);

        //this.bg.inputEnabled = true; // allow the click/tap event to actually do something

        game.physics.arcade.gravity.y = 500; //world gravity

    },

    makeTrash: function () {
        this.trash = game.add.group();
        this.trash.enableBody = true;

        for (i = 0; i < 5; i++) {
            var randomX = Math.floor(Math.random() * 600);
            this.trash.create(randomX, game.height - 5, 'trash');
        }

        this.trash.forEach(function (piece) {
            piece.anchor.setTo(0.5, 1);

            piece.body.gravity.y = 5;
            piece.body.moves = true;
            piece.body.velocity.setTo(100, 100);

            piece.body.collideWorldBounds = true;
            piece.body.bounce.set(0.75);
            piece.body.drag.x = 300;
        });
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
