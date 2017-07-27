var nutrientNo = 0; // Number of nutrient ingredients present.
var CO2No = 0; // Number of CO2 ingredients present.

var rand1 = -1;
var rand2 = -1;

var originalspeed = 400;
var speed = originalspeed;

var hits = 0;
var flip = true;

var nutrientammoOn = false;
var C02ammoOn = true;

var localScore = 0;

var treeState = {

    create: function () {

        if (!game.device.desktop) {
            this.addMobileInputs();
        }

        // Add background
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

        treeState.tScoreLabel = game.add.text(50, 30, 'Trees Planted: 0', {
            font: '20px Arial',
            fill: '#ffffff'
        });

        treeState.localScoreLabel = game.add.text(400, 30, 'Apples Created: 0', {
            font: '20px Arial',
            fill: '#ffffff'
        });

        // Add icons on UI to indicate ingredients
        this.nImage = game.add.image(40, 240, 'nutrient');
        this.nImage.scale.setTo(1.5, 1.5);
        this.nImage.inputEnabled = true;
        this.nImage.events.onInputDown.add(this.activateNutrientAmmo, this);

        this.CImage = game.add.image(40, 290, 'CO2');
        this.CImage.scale.setTo(1.5, 1.5);
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

        this.bulletSelectBox = game.add.image(100, 300, 'bulletSelect');
        this.bulletSelectBox.anchor.setTo(0.5, 0.5);
        this.bulletSelectBox.scale.setTo(1, .4);

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
    },

    growingappleProperties: function () {
        rand1 = Math.random();
        rand2 = Math.random();
    },

    speedUp: function () {
        if (flip && C02ammoOn) {
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
                this.appleGet(this.growingapple.x, this.growingapple.y);
                game.camera.shake(0.01, 200);
                localScore++;
                treeState.localScoreLabel.setText("Apples Created: " + localScore);
                Client.sendApple();
                hits = 0;
            }
            flip = false;
        }

        if (flip && nutrientammoOn && nutrientNo > 0) {
            this.appleGet(this.growingapple.x, this.growingapple.y);
            localScore++;
            treeState.localScoreLabel.setText("Apples Created: " + localScore);
            Client.sendApple();
            nutrientNo--;
            if (nutrientNo == 0) {
                this.activateCO2Ammo();
            }
            nutrientNoText.text = nutrientNo.toString();
            flip = false;
        }

    },

    release: function () {
        flip = true;
    },

    appleGet: function (x, y) {
        this.finishedapple = game.add.sprite(x, y, 'growingapple');
        this.finishedapple.anchor.setTo(0.5, 0.5);
        this.finishedapple.scale.setTo(0.5, 0.5);
        this.finishedapple.tint = 0xE60C0C;
        game.physics.arcade.enable(this.finishedapple);
        this.finishedapple.body.setCircle(37.5);
        var randdirection = Math.random();
        var randspeed = Math.random();
        if (randdirection >= .5) {
            var direction = 1;
        } else {
            var direction = -1;
        }
        this.finishedapple.body.velocity.x = (originalspeed * 4) * direction * randdirection;
        this.finishedapple.body.velocity.y = -700;
        this.finishedapple.body.acceleration.y = 1300;

        this.finishedapple.events.onOutOfBounds.add(this.destroyApple, this);
    },

    destroyApple: function (apple) {
        apple.destroy();
    },

    nutrientSupply: function () {
        nutrientNo++;
        nutrientNoText.text = nutrientNo.toString();
    },

    activateNutrientAmmo: function () {
        if (nutrientNo > 0) {
            this.bulletSelectBox.x = 100;
            this.bulletSelectBox.y = 250;
            nutrientammoOn = true;
            C02ammoOn = false;
        }
    },

    activateCO2Ammo: function () {
        this.bulletSelectBox.x = 100;
        this.bulletSelectBox.y = 300;
        nutrientammoOn = false;
        C02ammoOn = true;
    },


    createWorld: function () {
        game.add.image(0, 0, 'treeBG');
    },

    // ****************** MOBILE FUNCTIONS *****************
    addMobileInputs: function () {
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

    // ************** UNNEEDED BUT POSSIBLY USEFUL *********

    //    contains: function (a, ing) { // Checks whether an array "a" has an object "ing".
    //        for (var i = 0; i < a.length; i++) {
    //            if (a[i] === ing) {
    //                return true;
    //            }
    //        }
    //        return false;
    //    },

};