var wasCalledB = false;
var appleEaten = false;
var groundChecked = true;
var growChecked = true;

var flip = true;

var trashArray = [];

var birdState = {

    create: function () {

        // Add inputs.
        this.cursor = game.input.keyboard.createCursorKeys();
        this.debugAppleDrop = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.poopButton = game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.wasCalledToggle = game.input.keyboard.addKey(Phaser.Keyboard.R);

        // Create object for fallingApple.
        this.fallingApple = {};

        // Add background. 
        this.createWorld();

        // Create a group for allTrees (seeds and alive)
        this.allTrees = this.add.group();
        // Create a group for growingTrees
        this.growingTrees = this.add.group();

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

        // Add animations.
        this.birdplayer.animations.add('fly', [0, 1], 8, true);
        this.birdplayer.animations.add('fatfly', [2, 3], 10, true);

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
        game.physics.arcade.collide(this.seed, this.platforms, this.groundCheck, null, this);

        // For debug.
        if (this.wasCalledToggle.isDown && wasCalledB == true) {
            wasCalledB = false; // Toggle wasCalled back to false.
        }
        this.debugDrop();

        // Change angle of bird to encourage flapping.
        if (this.birdplayer.scale.x == 1) {
            if (this.birdplayer.angle > -20) {
                this.birdplayer.angle -= 1;
            }
        } else if (this.birdplayer.scale.x == -1) {
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
            this.birdplayer.frame = 2;
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
        groundChecked = false;

        this.emitter.x = x;
        this.emitter.y = y + 50;

        this.emitter.start(true, 1000, null, 10);

        var howhigh = Math.max(0, this.birdplayer.y);
        this.seed = this.allTrees.create(x, howhigh, 'tree');
        this.seed.anchor.setTo(0.5, 1);
        this.seed.frame = 0;

        game.physics.arcade.enable(this.seed, Phaser.Physics.ARCADE);
        this.seed.body.collideWorldBounds = true;
        this.seed.body.setSize(10, 300, 88, 0);

        for (i = 0; i < 5; i++) { // Send five pieces of decay per seed planted
            Client.sendDecay();
        }
    },

    groundCheck: function (seed, ground) {
        if (groundChecked == false) {
            if (game.physics.arcade.overlap(this.seed, this.trash)) {
                seed.frame = 2;
                console.log("Bad seed.");
                console.log("The length of allTrees is " + this.allTrees.length);
                console.log("The length of growingTrees is " + this.growingTrees.length);
            } else {
                seed.frame = 1; // Give it a healthy appearance
                this.growingTrees.children.unshift(seed); // Move seed to the front of growingTrees array.
                console.log("Good seed.");
                console.log("The length of allTrees is " + this.allTrees.length);
                console.log("The length of growingTrees is " + this.growingTrees.length);

                growChecked = false; // The growth needs to be checked.
                this.growCheck(); // Call for said growth check.

                Client.sendSeed(); // Ask the server to plant a seed
            }
        }

        seed.body.checkCollision.down = false;
        seed.body.checkCollision.up = false;
        seed.body.checkCollision.left = false;
        seed.body.checkCollision.right = false;
        seed.body.allowGravity = false;

        groundChecked = true;
    },

    growCheck: function () {
        if (this.growingTrees.children[4]) {
            this.advanceGrowth(this.growingTrees.children[4]);
        }
        if (this.growingTrees.children[9]) {
            this.advanceGrowth(this.growingTrees.children[9]);
        }
        if (this.growingTrees.children[14]) {
            this.advanceGrowth(this.growingTrees.children[14]);
        }
        growChecked = true;
    },

    advanceGrowth: function (treeToGrow) {
        if (treeToGrow.frame == 1) {
            treeToGrow.frame = birdState.getRandomInt(3, 6); // choose 3, 4, 5
        } else {
            treeToGrow.frame += 3;
        }
    },

    updateScore: function (bScore) {
        if (birdState.bScoreLabel) {
            birdState.bScoreLabel.setText('trees planted: ' + bScore);
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

        game.physics.arcade.gravity.y = 500; // World gravity
    },

    makeTrash: function () {
        this.trash = game.add.group();
        this.trash.enableBody = true;

        var trashImg = ['bottle', 'chips', 'can'];

        for (i = 0; i < 5; i++) {
            var randomX = Math.floor(Math.random() * 600);
            var selector = birdState.getRandomInt(0, 3);

            this.trash.create(randomX, game.height - 5, trashImg[selector]);
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

                if (this.birdplayer.scale.x == -1) {
                    this.birdplayer.scale.x = 1;
                }
                flip = false;

            } else if (this.cursor.right.isDown) {
                this.birdplayer.body.velocity.x = 350;
                this.jump();

                if (this.birdplayer.scale.x == 1) {
                    this.birdplayer.scale.x = -1;
                }
                flip = false;

            } else {
                // Stop the player
                this.birdplayer.body.velocity.x = 0;

                if (this.birdplayer.body.onFloor() || this.birdplayer.body.touching.down) {
                    this.birdplayer.animations.stop();
                    if (appleEaten == true) {
                        this.birdplayer.frame = 3;
                    } else {
                        this.birdplayer.frame = 1;
                    }

                    game.add.tween(this.birdplayer).to({
                        angle: 0
                    }, 100).start();
                }
            }
        }
    },

    jump: function () {
        if (this.birdplayer.scale.x == 1) {
            game.add.tween(this.birdplayer).to({
                angle: 20
            }, 100).start();
        } else if (this.birdplayer.scale.x == -1) {
            game.add.tween(this.birdplayer).to({
                angle: -20
            }, 100).start();
        }

        if (appleEaten == true) {
            this.birdplayer.animations.play('fatfly');
            this.birdplayer.body.velocity.y = -350;
        } else {
            this.birdplayer.animations.play('fly');
            this.birdplayer.body.velocity.y = -500;
        }
    },

    debugDrop: function () {
        if (!wasCalledB && this.debugAppleDrop.isDown && appleEaten == false) {
            wasCalledB = true;
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
