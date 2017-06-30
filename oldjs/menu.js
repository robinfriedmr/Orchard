//Menu

this.myPlayerID = -1;

// Create a playerList object. Possible uses for keeping track of data in states. 
this.playerList = {};

var menuState = {
    create: function () {
        // The background should be added first or we won't see some elements.
        //game.add.image(0, 0, 'dirtBG');

        // Spacebar and arrow key press is captured by the game, not the browser window.
        game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR]);

        //Allow arrow key inputs
        this.cursor = game.input.keyboard.createCursorKeys();
        //Allow WASD inputs
        //Allow spacebar input. Make spacebar press start game.
        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //spaceKey.onDown.add(this.start, this); ***THIS TURNS ON THE GAME VIA SPACEBAR PRESS.

        // If the device is mobile, a finger touch can make the game start.
        if (!game.device.desktop) {
            game.input.onDown.add(this.start, this);
        }

        var styleTitle = {
            font: '50px Arial',
            fill: '#ffffff'
        };
        // Display the name of the game
        var nameLabel = game.add.text(game.width / 2, 50, "Treehouse", styleTitle);
        nameLabel.anchor.setTo(0.5, 0.5);

        // Explain how to start the game based on the device used. Variable is text.
        var text;
        if (game.device.desktop) {
            text = 'click a level to start';
        } else {
            text = 'tap a level to start';
        }
        // Display the Text
        var startLabel = game.add.text(game.width / 2, game.height - 60,
            text, {
                font: '25px Arial',
                fill: '#ffffff'
            });
        startLabel.anchor.setTo(0.5, 0.5);

        this.dirtbutton = game.add.button(150, game.height / 2, 'dirtbutton', this.askDirt);
        this.dirtx = game.add.sprite(150, game.height / 2, 'x');
        this.dirtx.visible = false;

        this.waterbutton = game.add.button(250, game.height / 2, 'waterbutton', this.askWater);
        this.waterx = game.add.sprite(250, game.height / 2, 'x');
        this.waterx.visible = false;

        this.sunbutton = game.add.button(350, game.height / 2, 'sunbutton', this.askSun);
        this.sunx = game.add.sprite(350, game.height / 2, 'x');
        this.sunx.visible = false;

        // Ask server to create an ID for you.
        Client.askNewPlayer();

    },

    // Assign the player an ID. This is now a global variable.
    setID: function (id) {
        this.myPlayerID = id;
        console.log("The PlayerID I have now is " + this.myPlayerID);
    },

    // New player collects current values.
    // Existing players get refreshed values.
    giveIDs: function (dirt, water, sun) {
        this.dirtPlayer = dirt;
        this.waterPlayer = water;
        this.sunPlayer = sun;
        console.log("The players are now set equal to: " + dirt + ", " + water + ", " + sun);
        
        // If data comes back with a valid ID, don't let the new player choose that option.
        if (this.dirtPlayer >= 0) { 
            this.dirtx.visible = true;
            this.dirtbutton.inputEnabled = false;
        } else {
            this.dirtx.visible = false;
            this.dirtbutton.inputEnabled = true;
        }

        if (this.waterPlayer >= 0) {
            this.waterx.visible = true;
            this.waterbutton.inputEnabled = false;
        } else {
            this.waterx.visible = false;
            this.waterbutton.inputEnabled = true;
        }

        if (this.sunPlayer >= 0) {
            this.sunx.visible = true;
            this.sunbutton.inputEnabled = false;
        } else {
            this.sunx.visible = false;
            this.sunbutton.inputEnabled = true;
        }
    },

    // You want to play this state!
    askDirt: function () {
        Client.askDirt();
    },

    askWater: function () {
        Client.askWater();
    },

    askSun: function () {
        Client.askSun();
    },

    // You can begin this state!
    startDirt: function (id) {
        game.state.start('dirt');
        this.dirtPlayer = id;
        console.log("You, " + id + ", are dirtPlayer.");
    },

    startWater: function (id) {
        game.state.start('water');
        this.waterPlayer = id;
        console.log("You, " + id + ", are waterPlayer.");
    },

    startSun: function (id) {
        game.state.start('sun');
        this.sunPlayer = id;
        console.log("you, " + id + ", are sunPlayer.");
    },

    // Someone else has already taken this state!
    dirtNo: function (id) {
        this.dirtPlayer = id;
        this.dirtx.visible = true;
        this.dirtbutton.inputEnabled = false;
    },

    waterNo: function (id) {
        this.waterPlayer = id;
        this.waterx.visible = true;
        this.waterbutton.inputEnabled = false;
    },

    sunNo: function (id) {
        this.sunPlayer = id;
        this.sunx.visible = true;
        this.sunbutton.inputEnabled = false;
    },
};
