var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

//server.listen(8080);
var firebase = require("firebase");



// firebase.database().ref('/tracking/' + 'SO12').set({
//     "longitude" : "-1",
//     "latitude" : "10"
// });

// firebase.database().ref('/tracking/' + 'SO12').set({
//     "longitude" : "-1",
//     "latitude" : "10"
// });

// var liost = defaultDatabase.list('/tracking/SO12');
//
// console.log('list here', liost.valueChange());


server.listen(process.env.PORT || 8080, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

app.use(express.static('assets'));

// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// routing
app.get('/installer-rating.html', function (req, res) {
    res.sendFile(__dirname + '/installer-rating.html');
});

app.get('/installer', function (req, res) {
    res.sendFile(__dirname + '/installer.png');
});


// usernames which are currently connected to the chat
var usernames = {};
var installerStartingPoint = {};

// rooms which are currently available in chat
var rooms = [];

io.sockets.on('connection', function (socket) {

    socket.emit("Testing");
    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function({username, salesOrderNumber, typeOfUser}){
        // store the username in the socket session for this client
        socket.username = username;
        // store the room name in the socket session for this client
		rooms.push(salesOrderNumber);
        socket.room = salesOrderNumber;// SalesOrderNumber
        // add the client's username to the global list
        usernames[username] = username;
        // send client to room salesordernumber
        socket.join(salesOrderNumber);
        // echo to client they've connected
        socket.emit('updatechat', 'SERVER', 'you have connected to '+ salesOrderNumber);
        // echo to room 1 that a person has connected to their room
        socket.broadcast.to(salesOrderNumber).emit('updatechat', 'SERVER', username + ' has connected to this room'+ salesOrderNumber);
    });


    socket.on('checkupdates', function(data){
        // store the username in the socket session for this client
        socket.emit("We are checking for updates here");
    });

	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});


    socket.on('updateInstallerlocation', function (data) {
        io.sockets.adapter.rooms[data.salesOrderNumber].lat = data.InstallerLocation.latitude;
        io.sockets.adapter.rooms[data.salesOrderNumber].lng = data.InstallerLocation.longitude;
    });


	

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});
