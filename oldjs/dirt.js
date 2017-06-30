var wasCalled = false; // this is a variable temporarily needed to get the overlap with goal function tested. 

var dirtState = {

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

        // Add sprites to the game
        this.goal = game.add.sprite(game.width / 2 + 50, 100, 'goal'); // To be replaced with map tiles.

        this.dirtplayer = game.add.sprite(game.width / 2 - 190, game.height / 2 + 10, 'dirtplayer');
        this.nutrient = game.add.sprite(game.width / 2 + 200, game.height / 2, 'nutrient');

        //Enable physics on the sprites' bodies.
        game.physics.arcade.enable([this.dirtplayer, this.nutrient, this.goal]);

        this.nutrient.body.moves = true;
        this.goal.body.moves = false;

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

        // When the Player collides with the Nutrient, check for Spacebar Press and trigger Pull Nutrient.
        game.physics.arcade.collide(this.nutrient, this.dirtplayer, this.pullNutrient, this.spaceCheck, this);

        // If the nutrient overlaps with the goal sprite, Goal Achieved  is triggered.
        game.physics.arcade.overlap(this.nutrient, this.goal, this.goalAchieved, null, this);


        // If the player is dead, do nothing.
        if (!this.dirtplayer.alive) {
            return;
        }
        this.movePlayer();
        this.moveNutrient();
    },

    moveNutrient: function () {
        // Technically this is code to stop moving the nutrient if collision is not occurring. 
        if (!game.physics.arcade.collide(this.nutrient, this.dirtplayer)) {
            this.nutrient.body.velocity.x = 0;
            this.nutrient.body.velocity.y = 0;
        }
    },

    goalAchieved: function (nutrient, dirtplayer) {
        if (!wasCalled) {
            wasCalled = true;
            console.log("The wasCalled variable is ");
            console.log("Overlap achieved. GoalAchieved running.");
            this.dirtplayer.tint = 0xDDDD33
        }
    },

    // *** An attempt at getting pulling to work. *** 
    pullNutrient: function () {


        //game.physics.moveToObject(this.nutrient, this.dirtplayer);
        //        
        //        var radians = game.physics.arcade.angleBetween(this.dirtplayer, this.nutrient); 
        //        var degrees = radians * (180/Math.PI);                       
        //        
        //        game.physics.arcade.velocityFromAngle(degrees, 300, this.nutrient.body.velocity);    
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

        // Create the tilemap
        this.map = game.add.tilemap('dmap');
        // Add the tileset to the map
        this.map.addTilesetImage('tiles');
        // Create the layer by specifying the name of the Tiled layer
        this.layer = this.map.createLayer('Tile Layer 1');

        // Set the world size to match the size of the layer
        this.layer.resizeWorld();
        // Enable collisions for the XX'th tilset elements (dark dirt, roots, worms)
        this.map.setCollision();
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
            this.dirtplayer.body.velocity.x = -200;
            this.checkLoc();
        } else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
            this.dirtplayer.body.velocity.x = 200;
            this.checkLoc();
        } else if (this.cursor.down.isDown || this.wasd.down.isDown || this.moveDown) {
            this.dirtplayer.body.velocity.y = 200;
            this.checkLoc();
        } else if (this.cursor.up.isDown || this.wasd.up.isDown || this.moveUp) {
            this.dirtplayer.body.velocity.y = -200;
            this.checkLoc();
        } else {
            // Stop the player
            this.dirtplayer.body.velocity.x = 0;
            this.dirtplayer.body.velocity.y = 0;
            //this.dirtplayer.animations.stop(); //Cease any animation
            //this.dirtplayer.frame = 0; // Change frame (to stand still)
        }
    },

    checkLoc: function () { // If the dirtplayer is within a certain bounds, send a coordinate mapped for the water state, to display the dirtplayer's approximate location in the water state.
        if (this.dirtplayer.x >= 30 && this.dirtplayer.x <= 545 && this.dirtplayer.y <= 240) {
            xresult = Math.round(this.mapRange([30, 545], [233, 327], this.dirtplayer.x));
            yresult = Math.round(this.mapRange([0, 240], [325, 350], this.dirtplayer.y));
            Client.sendDirtCoords(xresult, yresult);
        }
    },

    mapRange: function (from, to, s) {
        return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
    },

    //    sendRange: function (result) {
    //        var range = 287.5;
    //
    //        console.log(result);
    //    },

    startMenu: function () {
        game.state.start('menu');
    },

    // ****************** MOBILE FUNCTIONS *****************
    addMobileInputs: function () {
        // Add the jump button
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

    render: function () {
        // Sprite debug info, including location information. 
        game.debug.spriteCoords(this.dirtplayer, 50, game.height - 100);
    },

};
