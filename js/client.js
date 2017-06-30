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

//Client.sendDirtCoords = function (xresult, yresult) {
//    Client.socket.emit('sendDirtCoords', xresult, yresult);  
//    console.log("Sending " + xresult + " and " + yresult + " to the server.");
//};

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

//Client.socket.on('receiveDirtCoords', function (x, y) {
//    waterState.receiveDirtCoords(x, y);
//    console.log("Dirt Coordinates have been received by the client.");
//    console.log(x + " is the x value.");
//});

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

Client.socket.on('birdNo', function (data) {
    menuState.birdNo(data);
});
// ~~`` End Server Assigning States ``~~