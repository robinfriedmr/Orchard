//Boot

//The bootState comes first. It loads things before anything else loads, such as the progress bar for the loading screen, and some basic settings that we previously included in 'main.js' (now play.js).

var bootState = {
    preload: function () {
        // Load images
        game.load.image('birdBG', 'assets/img/birdBG.png');
        game.load.image('treeBG', 'assets/img/treeBG.png');
        game.load.image('wormBG', 'assets/img/wormBG.png');

        game.load.image('birdbutton', 'assets/img/birdbutton.png');
        game.load.image('treebutton', 'assets/img/treebutton.png');
        game.load.image('wormbutton', 'assets/img/wormbutton.png');
        game.load.image('x', 'assets/img/x.png');

        game.load.image('wormsquare', 'assets/img/wormsquare.png');
        game.load.image('decay', 'assets/img/decaysquare.png');
        game.load.image('nutrient', 'assets/img/nutrient.png');
        game.load.image('goal', 'assets/img/goal.png');
        game.load.image('root', 'assets/img/root.png');

        game.load.image('water', 'assets/img/water.png');
        game.load.image('CO2', 'assets/img/CO2.png');
        game.load.image('growingapple', 'assets/img/growingapple.png');
        game.load.image('bulletSelect', ' assets/img/bulletSelect.png');

        game.load.spritesheet('bird', 'assets/img/bird.png', 50, 60);
        game.load.image('seeds', 'assets/img/seeds.png');

        //Tiles is universal. Dmap is for the dirt level.
        //        game.load.image('tiles', 'assets/tiles.png');
        //        game.load.tilemap('dmap', 'assets/dmap.json', null, Phaser.Tilemap.TILED_JSON);

    },

    create: function () {
        // Set some game settings
        game.stage.backgroundColor = '#4ECF3E';
        game.renderer.renderSession.roundPixels = true;
        game.stage.disableVisibilityChange = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // If the device is not a desktop (a mobile device)
        if (!game.device.desktop) {
            // Set the type of scaling to 'show all'
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // Set the min and max width/height of the game
            game.scale.setMinMax(game.width / 2, game.height / 2,
                game.width * 2, game.height * 2);
            // Center the game on the screen
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            document.body.style.backgroundColor = '#4ECF3E';
        }

        // Start the menu state
        game.state.start('menu');
    },
};