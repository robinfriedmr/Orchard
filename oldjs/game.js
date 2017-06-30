//Game -- Initialize all game states.

// Initialize Phaser
var game = new Phaser.Game(
    120 * 5,
    70 * 5,
);

// Define our global variable
//game.global = {
//    score: 0
//};

// Add all the states
game.state.add('boot', bootState);
game.state.add('menu', menuState);

game.state.add('dirt', dirtState);
game.state.add('water', waterState);
game.state.add('sun', sunState);

// Start the 'boot' state
game.state.start('boot');
