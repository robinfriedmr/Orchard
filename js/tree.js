var nutrientNo = 0; // Create global variable 'nutrientNo' to represent the number of nutrient ingredients present.
console.log("nutrientNo is starting at " + nutrientNo);
var CO2No = 0; // Number of CO2 ingredients present.
var waterNo = 0; // Number of water ingredients present.

var wasCalled = false; // for debug.

const RADIUS = 60; // Radius of circular motion.
const SPEED = 0.0005 // Speed of the circular motion.

var treeState = {

    create: function () {

        if (!game.device.desktop) {
            this.addMobileInputs();
        }

        // Arrow and WASD keys
        this.cursor = game.input.keyboard.createCursorKeys();
        this.debugKeys = {
            nutBut: game.input.keyboard.addKey(Phaser.Keyboard.Q),
            wasCalledToggle: game.input.keyboard.addKey(Phaser.Keyboard.W),
            e: game.input.keyboard.addKey(Phaser.Keyboard.E),
            r: game.input.keyboard.addKey(Phaser.Keyboard.R),
        };
        this.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Add background and map (eventually) 
        this.createWorld();

        // Add icons on UI to indicate ingredients
        this.nImage = game.add.image(40, 185, 'nutrient');
        this.CImage = game.add.image(40, 235, 'CO2');
        this.wImage = game.add.image(40, 285, 'water');

        // Add numbers to show the number of ingredients in each stack.
        var textStyle_Nutrient = {font: "bold 18px sans-serif", fill: "#fff", align: "center"};
        nutrientNoText = game.add.text(90, 185, nutrientNo.toString(), textStyle_Nutrient);
        CO2NoText = game.add.text(90, 235, CO2No.toString(), textStyle_Nutrient);
        waterNoText = game.add.text(90, 285, waterNo.toString(), textStyle_Nutrient);

        // Add sprites to the game
        this.growingapple = game.add.sprite(game.width / 2, game.height / 2, 'growingapple');
        this.growingapple.anchor.setTo(0.5, 0.5);

        //Enable physics on the sprites' bodies.
        game.physics.arcade.enable([this.growingapple]);
        this.growingapple.body.setCircle(37.5); // set growingapple's body to a circle with a 37.5 px radius


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
        game.physics.arcade.overlap(this.nutrientIng, this.growingapple, this.addNutrientIng, null, this);

        var period = game.time.now * SPEED; // *** I'd like to get a red tint related to the period eventually.
        this.growingapple.x = game.world.centerX + Math.cos(period) * RADIUS;
        this.growingapple.y = game.world.centerY + Math.sin(period) * RADIUS;

        this.debugNutrient(); // Call in a nutrient when conditions are met.

        if (this.debugKeys.wasCalledToggle.isDown && wasCalled == true) {
            wasCalled = false; // Toggle wasCalled back to false.
            console.log("wasCalled is now " + wasCalled);
        }
    },

    debugNutrient: function () {
        if (!wasCalled && this.debugKeys.nutBut.isDown) { // If wasCalled is false and the nutrient button is pressed, 
            wasCalled = true; // set wasCalled to true to prevent the event from triggering a zillion times, and
            console.log("wasCalled is now " + wasCalled); // print to the console the new value for wasCalled.

            this.nutrientSupply(); // And, most importantly, run the nutrientSupply function.
        }
    },

    nutrientSupply: function () {

        if (nutrientNo == 0) {
            this.buildNutrient(); // Build a new *sprite* only if there aren't any already existing in the stack.
        }

        nutrientNo++;
        nutrientNoText.text = nutrientNo.toString();
        console.log("nutrientNo is " + nutrientNo);

    },

    buildNutrient: function () {
        // Initialize nutrientIng.
        this.nutrientIng = game.add.sprite(150, 150, 'nutrient'); // Add the sprite for the ingredient 'nutrient'
        this.nutrientIng.anchor.setTo(0.5, 0.5); // The coordinates are for the center of the sprite.
        game.physics.arcade.enable(this.nutrientIng); // Give sprite a body.
        this.nutrientIng.inputEnabled = true; // Input Enable the sprite.
        this.nutrientIng.input.enableDrag(true); // Allow dragging - 'true' parameter makes the sprite snap to the center.
    },

    addNutrientIng: function (nutrientIng, growingapple) {
        nutrientIng.destroy(); // Destroy dragged sprite. 
        if (nutrientNo > 1) { // If there was more than one nutrient in the stack,
            this.buildNutrient(); // Replace the draggable sprite.
        }

        // Replace the dragged sprite with a sprite snapped to the growingapple.
        snappedNIng = growingapple.addChild(game.make.sprite(0, -20, 'nutrient'));
        snappedNIng.anchor.setTo(0.5, 0.5);

        // Decrease the number of nutrients available.
        nutrientNo--;
        nutrientNoText.text = nutrientNo.toString();
        console.log("An overlap has occurred. NutrientNo is " + nutrientNo);
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
        game.add.image(0, 0, 'treeBG');

        //        // Create the tilemap
        //        this.map = game.add.tilemap('wmap');
        //        // Add the tileset to the map
        //        this.map.addTilesetImage('tiles');
        //        // Create the layer by specifying the name of the Tiled layer
        //        this.layer = this.map.createLayer('Tile Layer 1');
        //
        //        // Set the world size to match the size of the layer
        //        this.layer.resizeWorld();
        //        // Enable collisions for the XXth tilset element
        //        this.map.setCollision();
        //    
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
    //            this.treeplayer.body.velocity.x = -200;
    //        } else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
    //            this.treeplayer.body.velocity.x = 200;
    //        } else if (this.cursor.down.isDown || this.wasd.down.isDown || this.moveDown) {
    //            this.treeplayer.body.velocity.y = 200;
    //        } else if (this.cursor.up.isDown || this.wasd.up.isDown || this.moveUp) {
    //            this.treeplayer.body.velocity.y = -200;
    //        } else {
    //            // Stop the player
    //            this.treeplayer.body.velocity.x = 0;
    //            this.treeplayer.body.velocity.y = 0;
    //            //this.player.animations.stop(); //Cease any animation
    //            //this.player.frame = 0; // Change frame (to stand still)
    //        }
    //    },

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
