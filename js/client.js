var address = window.location.origin + ":8152";

var Client = {};
Client.socket = io.connect(address);

//************FROM GAME******************
Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
};

Client.askWorm = function () {
    Client.socket.emit('wormRequest');
};

Client.askTree = function () {
    Client.socket.emit('treeRequest');
};

Client.askBird = function () {
    Client.socket.emit('birdRequest');
};

Client.sendNutrient = function () {
    Client.socket.emit('sendNutrient');
};

Client.pullNutrient = function () {
    Client.socket.emit('pullNutrient');
};

Client.sendApple = function () {
    Client.socket.emit('sendApple');
};

<<<<<<< HEAD
<<<<<<< HEAD
Client.sendDecay = function (data) {
    Client.socket.emit('sendDecay', data);  
=======
=======
>>>>>>> merged-games
Client.sendDecay = function () {
    Client.socket.emit('sendDecay');
>>>>>>> austinbranch
};

Client.sendSeed = function (seedX) {
    Client.socket.emit('sendSeed', seedX);
};

//************FROM SERVER****************
Client.socket.on('you', function (data) {
    menuState.setID(data);
});

Client.socket.on('giveIDs', function (data) {
    menuState.giveIDs(data.wormPD, data.treePD, data.birdPD);
});

Client.socket.on('refreshID', function (data) {
    menuState.giveIDs(data.wormPD, data.treePD, data.birdPD);
});

Client.socket.on('receiveNutrient', function () {
    treeState.nutrientSupply();
});

Client.socket.on('eraseNutrient', function () {
    wormState.eraseNutrient();
});

Client.socket.on('receiveApple', function () {
    birdState.appleDrop();
});

<<<<<<< HEAD
<<<<<<< HEAD
Client.socket.on('receiveDecay', function (data) {
    console.log(data + " is what the number of decay sent to worm player.")
    wormState.newDecay(data); 
=======
=======
>>>>>>> merged-games
Client.socket.on('receiveDecay', function () {
    wormState.newDecay();
>>>>>>> austinbranch
});

Client.socket.on('plantSeed', function (seedX) {
    birdState.plantSeed(seedX);
});

Client.socket.on('plantRoot', function () {
    wormState.drawRoot(); 
});

Client.socket.on('updateScore', function (score) {
    wormState.updatewScore(score);
    treeState.updateScore(score);
    birdState.updateScore(score);
});

// ~~`` Start Server Assigning States ``~~
Client.socket.on('wormGo', function (data) {
    menuState.startWorm(data);
});

Client.socket.on('wormNo', function (data) {
    menuState.wormNo(data);
});

Client.socket.on('treeGo', function (data) {
    menuState.startTree(data);
});

Client.socket.on('treeNo', function (data) {
    menuState.treeNo(data);
});

Client.socket.on('birdGo', function (data) {
    menuState.startBird(data);
});

Client.socket.on('plantRoot', function () {
    wormState.drawRoot();
});

Client.socket.on('birdNo', function (data) {
    menuState.birdNo(data);
});
// ~~`` End Server Assigning States ``~~