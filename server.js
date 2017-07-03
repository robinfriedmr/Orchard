var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io').listen(httpServer);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

httpServer.lastPlayerID = 0;

// Revising this to reflect new roles.
httpServer.currentData = { // 'PD' for Player Data
    wormPD: -1,
    treePD: -1,
    birdPD: -1
};

httpServer.listen(8152, function () {
    console.log('Listening on ' + httpServer.address().port);
});

io.on('connection', function (socket) {
    console.log("Connected!");

    socket.on('newplayer', function () {
        console.log("New player received");

        socket.player = {
            id: httpServer.lastPlayerID++,
        };
        // Assign your id to yourself.
        socket.emit('you', socket.player.id);

        socket.on('disconnect', function () {
            console.log("Player " + socket.player.id + " disconnected.");
            
            // Check player ID against currentData.
            // Change that player ID value back to -1 (invalid ID).
            // Send the currentData out for all connected players. 
            
            if (socket.player.id == httpServer.currentData.wormPD) {
                httpServer.currentData.wormPD = -1;
                io.emit('refreshID', httpServer.currentData);
            } else if (socket.player.id == httpServer.currentData.treePD) {
                httpServer.currentData.treePD = -1;
                io.emit('refreshID', httpServer.currentData);
            } else if (socket.player.id == httpServer.currentData.birdPD) {
                httpServer.currentData.birdPD = -1;
                io.emit('refreshID', httpServer.currentData);
            } else {
                return;
            }
            
        });

        // BEGIN REQUEST FUNCTIONS
        socket.on('wormRequest', function () {
            // The player who requested Worm is given their own ID.
            socket.emit('wormGo', socket.player.id);
            // Everyone else is not allowed to choose Worm.
            httpServer.currentData.wormPD = socket.player.id; // update currentData object on server
            socket.broadcast.emit('wormNo', httpServer.currentData.wormPD); // emit the new value of wormPD
            console.log(httpServer.currentData.wormPD + " is the ID value of wormPD.");
        });
        socket.on('treeRequest', function () {
            // The player who requested Tree is given their own ID.
            socket.emit('treeGo', socket.player.id);      
            // Everyone else is not allowed to choose Tree.
            httpServer.currentData.treePD = socket.player.id;
            socket.broadcast.emit('treeNo', httpServer.currentData.treePD);
            console.log(httpServer.currentData.treePD + " is the Tree player.")
        });
        socket.on('birdRequest', function () {
            // The player who requested Bird is given their own ID.
            socket.emit('birdGo', socket.player.id);   
            // Everyone else is not allowed to choose Bird.
            httpServer.currentData.birdPD = socket.player.id;
            socket.broadcast.emit('birdNo', httpServer.currentData.birdPD);
            console.log(httpServer.currentData.birdPD + " is the Bird player.")
        });
        // END REQUEST FUNCTIONS

        console.log("Sending the following to new players:"); // Has data been defined, and if so, how so?
        if (httpServer.currentData.wormPD >= 0 || httpServer.currentData.treePD >= 0 || httpServer.currentData.birdPD >= 0) {
            socket.emit('giveIDs', httpServer.currentData); // Send currentData object (with IDs inside).
            console.log(httpServer.currentData);
        } else if (!httpServer.currentData.wormPD && !httpServer.currentData.treePD && !httpServer.currentData.birdPD) {
            console.log("N/A All data is undefined.")
        } else {
            console.log("Not all roles are undefined, but no role has been given a valid player ID.");
        }
        
        socket.on('sendNutrient', function() {
            console.log("server has wormplayer's nutrient")
            socket.broadcast.emit('receiveNutrient');
        });

    });
});
