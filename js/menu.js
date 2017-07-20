//Menu

this.myPlayerID = -1;
this.running = false;

// Create a playerList object. Possible uses for keeping track of data in states. 
//this.playerList = {};

var menuState = {
    create: function () {

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
        
        this.running = true;

        this.running = true;

        // Display the name of the game
        var styleTitle = {
            font: '50px Arial',
            fill: '#ffffff'
        };
        var nameLabel = game.add.text(game.width / 2, 50, "Orchard", styleTitle);
        nameLabel.anchor.setTo(0.5, 0.5);

        // Explain how to start the game based on the device used. Variable is text.
        var text;
        if (game.device.desktop) {
            text = 'click a level to start';
        } else {
            text = 'tap a level to start';
        }
        var startLabel = game.add.text(game.width / 2, game.height - 60,
            text, {
                font: '25px Arial',
                fill: '#ffffff'
            });
        startLabel.anchor.setTo(0.5, 0.5);

        this.wormbutton = game.add.button(game.width / 2 - 150, game.height / 2 - 25, 'wormbutton', this.askWorm);
        this.wormx = game.add.sprite(game.width / 2 - 150, game.height / 2 - 25, 'x');
        this.wormx.visible = false;

        this.treebutton = game.add.button(game.width / 2 - 25, game.height / 2 - 25, 'treebutton', this.askTree);
        this.treex = game.add.sprite(game.width / 2 - 25, game.height / 2 - 25, 'x');
        this.treex.visible = false;

        this.birdbutton = game.add.button(game.width / 2 + 100, game.height / 2 - 25, 'birdbutton', this.askBird);
        this.birdx = game.add.sprite(game.width / 2 + 100, game.height / 2 - 25, 'x');
        this.birdx.visible = false;

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
    giveIDs: function (worm, tree, bird) {
        this.wormPlayer = worm;
        this.treePlayer = tree;
        this.birdPlayer = bird;
        console.log("The players are now set equal to: " + worm + ", " + tree + ", " + bird);

        if (this.running == true) { // If menu state is currently running...
            // If data comes back with a valid ID, don't let the new player choose that option.
            if (this.wormPlayer >= 0) {
                this.wormx.visible = true;
                this.wormbutton.inputEnabled = false;
            } else {
                this.wormx.visible = false;
                this.wormbutton.inputEnabled = true;
            }

            if (this.treePlayer >= 0) {
                this.treex.visible = true;
                this.treebutton.inputEnabled = false;
            } else {
                this.treex.visible = false;
                this.treebutton.inputEnabled = true;
            }

            if (this.birdPlayer >= 0) {
                this.birdx.visible = true;
                this.birdbutton.inputEnabled = false;
            } else {
                this.birdx.visible = false;
                this.birdbutton.inputEnabled = true;
            }
        }
    },

    // You want to play this state!
    askWorm: function () {
        Client.askWorm();
    },

    askTree: function () {
        Client.askTree();
    },

    askBird: function () {
        Client.askBird();
    },

    // You can begin this state!
    startWorm: function (id) {
        this.running = false;
        game.state.start('worm');
        this.wormPlayer = id;
        console.log("You, " + id + ", are wormPlayer.");
    },

    startTree: function (id) {
        this.running = false;
        game.state.start('tree');
        this.treePlayer = id;
        console.log("You, " + id + ", are treePlayer.");
    },

    startBird: function (id) {
        this.running = false;
        game.state.start('bird');
        this.birdPlayer = id;
        console.log("you, " + id + ", are birdPlayer.");
    },

    // Someone else has already taken this state!
    wormNo: function (id) {
        this.wormPlayer = id;
        this.wormx.visible = true;
        this.wormbutton.inputEnabled = false;
    },

    treeNo: function (id) {
        this.treePlayer = id;
        this.treex.visible = true;
        this.treebutton.inputEnabled = false;
    },

    birdNo: function (id) {
        this.birdPlayer = id;
        this.birdx.visible = true;
        this.birdbutton.inputEnabled = false;
    },

    // MOBILE-ONLY FUNCTIONS
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