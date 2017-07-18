var nutrientNo = 0; // Create global variable 'nutrientNo' to represent the number of nutrient ingredients present.
var CO2No = 0; // Number of CO2 ingredients present.

var rand1 = -1;
var rand2 = -1;
var originalspeed = 600;
var speed = originalspeed;

var hits = 0;
var flip = true;

var nutrientammoOn = false;
var C02ammoOn = true;

var treeState = {

    create: function () {

        if (!game.device.desktop) {
            this.addMobileInputs();
        }

        // Arrow and WASD keys
        this.cursor = game.input.keyboard.createCursorKeys();
        this.wasd = {
            Left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            Right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };

        // Add background and map (eventually) 
        this.createWorld();
        // Add sprites to the game
        this.growingapple = game.add.sprite(game.width / 2, game.height / 2, 'growingapple');
        this.growingapple.anchor.setTo(0.5, 0.5);
        this.growingapple.scale.setTo(0.75, 0.75);
        this.growingapple.tint = 0x17E60C;

        //Enable physics on the sprites' bodies.
        game.physics.arcade.enable([this.growingapple]);
        this.growingapple.body.setCircle(37.5); // set growingapple's body to a circle with a 37.5 px radius
        this.growingapple.body.collideWorldBounds = true;
        this.growingapple.body.bounce.setTo(1, 1);
        this.growingapple.inputEnabled = true;

        this.growingapple.events.onInputDown.add(this.speedUp, this);
        this.growingapple.events.onInputUp.add(this.release, this);

        treeState.tScoreLabel = game.add.text(50, 30, 'trees planted: 0', {
            font: '24px Arial',
            fill: '#ffffff'
        });

        // Add icons on UI to indicate ingredients
        this.nImage = game.add.image(40, 240, 'nutrient');
        this.nImage.inputEnabled = true;
        this.nImage.events.onInputDown.add(this.activateNutrientAmmo, this);


        this.CImage = game.add.image(40, 290, 'CO2');
        this.CImage.inputEnabled = true;
        this.CImage.events.onInputDown.add(this.activateCO2Ammo, this);

        // Add numbers to show the number of ingredients in each stack.
        var textStyle_Nutrient = {
            font: "bold 18px sans-serif",
            fill: "#fff",
            align: "center"
        };
        nutrientNoText = game.add.text(90, 240, nutrientNo.toString(), textStyle_Nutrient);
        CO2NoText = game.add.text(90, 290, 'Unlimited', textStyle_Nutrient);


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

        game.time.events.loop(Phaser.Timer.SECOND, this.growingappleProperties, this);

    },

    update: function () {
        // Collisions should always go at the top of the Update function.
        game.physics.arcade.overlap(this.nutrientIng, this.growingapple, this.addNutrientIng, null, this);
        game.physics.arcade.overlap(this.CO2Ing, this.growingapple, this.addCO2Ing, null, this);

        if (this.wasd.Right.isDown) {
            speed = speed + 1;
        }
        if (this.wasd.Left.isDown) {
            speed = speed - 1;
        }

        if (rand1 >= .66) {
            this.growingapple.body.acceleration.x = speed;
        } else if (rand1 <= .33) {
            this.growingapple.body.acceleration.x = -speed;
        } else {
            this.growingapple.body.acceleration.x = 0;
        }

        if (rand2 >= .66) {
            this.growingapple.body.acceleration.y = speed;
        } else if (rand2 <= .33) {
            this.growingapple.body.acceleration.y = -speed;
        } else {
            this.growingapple.body.acceleration.y = 0;
        }

        this.growingapple.body.maxVelocity.x = speed;
        this.growingapple.body.maxVelocity.y = speed;

        console.log(hits);


    },

    growingappleProperties: function () {
        rand1 = Math.random();
        rand2 = Math.random();
    },

    clearApple: function () {},

    speedUp: function () {
        if (flip && C02ammoOn) {
            console.log("hit with CO2Ammo");
            hits++;
            if (hits == 1) {
                this.growingapple.tint = 0xE6B70C;
                speed = speed * 2;
            }
            if (hits == 2) {
                this.growingapple.tint = 0xE60C0C;
                speed = speed * 2;
            }
            if (hits == 3) {
                this.growingapple.tint = 0x17E60C;
                speed = originalspeed;
                Client.sendApple();
                hits = 0;
            }
            flip = false;
        }

        if (flip && nutrientammoOn && nutrientNo > 0) {
            console.log("hit with nutrientAmmo");
            Client.sendApple();
            nutrientNo--;
            nutrientNoText.text = nutrientNo.toString();
            flip = false;
        }

    },

    release: function () {
        flip = true;
    },

    nutrientSupply: function () {
        nutrientNo++;
        nutrientNoText.text = nutrientNo.toString();
        console.log("nutrientNo is " + nutrientNo);
    },

    activateNutrientAmmo: function () {
        nutrientammoOn = true;
        C02ammoOn = false;
        console.log("nutrientAmmoActive");
    },

    activateCO2Ammo: function () {
        nutrientammoOn = false;
        C02ammoOn = true;
        console.log("C02AmmoActive");
    },


    createWorld: function () {
        game.add.image(0, 0, 'treeBG');
    },

    updateScore: function (tScore) {
        if (treeState.tScoreLabel) {
            treeState.tScoreLabel.setText('trees planted: ' + tScore);
        }
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

    // **************UNNEEDED BUT POSSIBLY USEFUL

    //    contains: function (a, ing) { // Checks whether an array "a" has an object "ing".
    //        for (var i = 0; i < a.length; i++) {
    //            if (a[i] === ing) {
    //                return true;
    //            }
    //        }
    //        return false;
    //    },

};