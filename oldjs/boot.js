//Boot

//The bootState comes first. It loads things before anything else loads, such as the progress bar for the loading screen, and some basic settings that we previously included in 'main.js' (now play.js).

var bootState = {
    preload: function () {
        // Load images
        game.load.image('sunBG', 'assets/sun.png');
        game.load.image('waterBG', 'assets/water.png');
        game.load.image('dirtBG', 'assets/dirt.png');
        
        game.load.image('sunbutton', 'assets/sunbutton.png');
        game.load.image('waterbutton', 'assets/waterbutton.png');
        game.load.image('dirtbutton', 'assets/dirtbutton.png');
        game.load.image('x', 'assets/x.png');

        game.load.image('sunplayer', 'assets/sunplayer.png');
        game.load.image('waterplayer', 'assets/waterplayer.png');
        game.load.image('smwater', 'assets/smwater.png');
        game.load.image('dirtplayer', 'assets/dirtplayer.png');
        game.load.image('smdirt', 'assets/smdirt.png');

        game.load.image('nutrient', 'assets/nutrient.png');
        game.load.image('goal', 'assets/goal.png');


        game.load.image('upButton', 'assets/upButton.png');
        game.load.image('rightButton', 'assets/rightButton.png');
        game.load.image('leftButton', 'assets/leftButton.png');

        //Tiles is universal. Dmap is for the dirt level.
        game.load.image('tiles', 'assets/tiles.png');
        game.load.tilemap('dmap', 'assets/dmap.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('wmap', 'assets/wmap.json', null, Phaser.Tilemap.TILED_JSON);

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
            // Add a blue color to the page to hide potential white borders
            document.body.style.backgroundColor = '#4ECF3E';
        }

        // Start the menu state
        game.state.start('menu');
    },

    //We only need the boot to run once, so there is no update function.
};
