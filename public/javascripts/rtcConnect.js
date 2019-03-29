"use strict";

var uIndex = 0;
var tempIndex;
// This client receives a message
var peerConnLocal=[];
var peerConnRemote;
var dataChannel=[];

var configuration = {
	"iceServers": [{
		"urls": "stun:stun.l.google.com:19302"
	}]
};

var isInitiator;
var clientIdG;
var idToRespond;
var curIndex;

var socket = io.connect();
console.log(socket);
function startConn() {
	window.room = prompt("Enter room name:");

	if (room !== "") {
		socket.emit("create or join", room);
		//console.log("Attempted to create or  join room", room);
	}


}

socket.on("ipaddr", function (ipaddr) {
	//console.log("Server IP address is: " + ipaddr);
	// updateRoomURL(ipaddr);
});

socket.on("created", function (room, clientId) {
	//console.log("Created room", room, "- my client ID is", clientId);
    isInitiator = true;
    clientIdG = clientId;
	start();
});

socket.on("joined", function (idToSend, room, clientId, index) {
	//console.log("This peer has joined room", room, "with client ID", clientId);
	isInitiator = false;
	uIndex = index;
    createPeerConnectionLocal(idToSend, isInitiator, configuration);
    clientIdG=clientId;
});

socket.on("start", function() {
	setTimeout(start,200);
});

socket.on("full", function (room) {
	alert("Room " + room + " is full. We will create a new room for you.");
	window.location.hash = "";
	window.location.reload();
});

socket.on("ready", function (room, socketId) {
    console.log("Socket is ready");
	createPeerConnectionRemote(isInitiator, configuration, socketId);
});

socket.on("log", function (array) {
	//console.log.apply(console, array);
});

socket.on("message", function (message) {
	//console.log("Client received message:", message);
	signalingMessageCallbackLocal(message);
});

function sendMessage(message) {
	socket.emit("broadcast", message, window.room);
}

function sendPrivateMessage(message) {
    socket.emit("private", message);
}

function iceSuccess() {

}
function signalingMessageCallbackLocal(message, dest) {
	if (message.type === "offer") {
		//console.log("Got offer. Sending answer to peer.");
        peerConnLocal[message.sId].setRemoteDescription(message.desc).then(function() {}, logError);
		peerConnLocal[message.sId].createAnswer().then(onRemoteSessionCreated.bind(null, message.sId), logError);

	} else if (message.type === "answer") {
		//console.log("Got answer.");
		peerConnLocal[message.sId].setRemoteDescription(message.desc).then( function () { },
			logError);

	} else if (message.type === "candidate") {
		peerConnLocal[message.sId].addIceCandidate(new RTCIceCandidate({
			candidate: message.candidate,
			sdpMid: message.mid,
			sdpMLineIndex: message.label
		}));
	}
}

function createPeerConnectionRemote(isInitiator, config, id) {
	peerConnLocal[id] = new RTCPeerConnection(config);

	peerConnLocal[id].onicecandidate = function (event) {
		//console.log("icecandidate event:", event);
		if (event.candidate) {
			sendPrivateMessage({
				type: "candidate",
				label: event.candidate.sdpMLineIndex,
				mid: event.candidate.sdpMid,
                candidate: event.candidate.candidate,
                id: id,
                sId: clientIdG
			});
		}
	};
    
    //console.log("Creating Data Channel");
	peerConnLocal[id].ondatachannel = function (event) {
		// console.log("ondatachannel:", event.channel);
		var i = dataChannel.push(event.channel)-1;
		onDataChannelCreated(dataChannel[i]);
	};
}

function createPeerConnectionLocal(id, isInitiator, config) {
	//console.log("Creating Peer connection as initiator?", isInitiator, "config:",
	//	config);
	peerConnLocal[id] = new RTCPeerConnection(config);
	// peerConnRemote = new RTCPeerConnection(config);

	// send any ice candidates to the other peer
	peerConnLocal[id].onicecandidate = function (event) {
		//console.log("icecandidate event:", event);
		if (event.candidate) {
			sendPrivateMessage({
				type: "candidate",
				label: event.candidate.sdpMLineIndex,
				mid: event.candidate.sdpMid,
                candidate: event.candidate.candidate,
                id: id,
                sId: clientIdG
			});
		}
	};

    
    var i = dataChannel.push( peerConnLocal[id].createDataChannel("musicTransfer"))-1;
	onDataChannelCreated(dataChannel[i]);
	
	peerConnLocal[id].createOffer().then(onLocalSessionCreated.bind(null, id), logError);
}

// function createPeerConnectionRemote(isInitiator, config) {
// 	//console.log("Creating Peer connection as initiator?", isInitiator, "config:",
// 	//	config);
	

// 	// send any ice candidates to the other peer
	

    
    
// }

function onLocalSessionCreated(index, desc) {
    //console.log("local session created:", desc);
    console.log(index);
	sendPrivateMessage({
		type:"offer",
        desc: desc,
        sId: clientIdG,
        id: index
	});
	peerConnLocal[index].setLocalDescription(desc);
	// peerConnRemote.setRemoteDescription(desc);
	// //     function () {
	// // 	//console.log("sending local desc:", peerConn.localDescription);
	// // 	sendMessage(peerConnLocal.localDescription);
	// // }, logError);
	// peerConnRemote.createAnswer().then(onRemoteSessionCreated, logError);
}

function onRemoteSessionCreated(index, desc) {
    peerConnLocal[index].setLocalDescription(desc);
    sendPrivateMessage({
        type: "answer",
        desc: desc,
        sId: clientIdG,
        id: index
    })
}

function onDataChannelCreated(channel) {
	//console.log("onDataChannelCreated:", channel);

	channel.onopen = function () {
		//console.log("CHANNEL opened!!!");
        console.log("teste");
	};

	channel.onclose = function () {
		//console.log("Channel closed.");
		
	};

	channel.onmessage = function () {
		//apply corresponding function
		receiveData(event);
	};
}

function receiveData(e) {
	var information = JSON.parse(e.data);
	window[information.functionName](information.args);
	if (information.generate) generateAll();
}

function sendData(jsonFunction) {
    dataChannel.forEach(function(channel) {
        if (!channel) {
            logError("Connection has not been initiated. " +
                "Get two peers in the same room first");
            return;
        } else if (channel.readyState === "closed") {
            //logError("Connection was lost. Peer closed the connection.");
            return;
        }
    
        channel.send(jsonFunction);
    });
}

function show() {
	Array.prototype.forEach.call(arguments, function (elem) {
		elem.style.display = null;
	});
}

function hide() {
	Array.prototype.forEach.call(arguments, function (elem) {
		elem.style.display = "none";
	});
}

function randomToken() {
	return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function logError(err) {
	if (!err) return;
	if (typeof err === "string") {
		console.warn(err);
	} else {
		console.warn(err.toString(), err);
	}
}
