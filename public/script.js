const socketIO = io('/');
const video = document.createElement('video');
const videoGrid = document.getElementById('video-grid');

const peer = new Peer(undefined, {
    host: 'peerjs-server.herokuapp.com',
    secure: true,
    port: 443,
});

const connectedPeers = {};

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(video, stream);

    peer.on('call', call => {
        call.answer(stream);
        const videoElement = document.createElement('video');
        call.on('stream', videoStream => {
            addVideoStream(videoElement, videoStream);
        });
    });

    socketIO.on('connected', userId => {
        newUserConnected(userId, stream);
    });
});

socketIO.on('disconnected', userId => {
    if (connectedPeers[userId]) { 
        connectedPeers[userId].close(); 
    }
});

peer.on('open', id => {
    socketIO.emit('join', ROOM_ID, id);
});

const newUserConnected = (userId, stream) => {
    const call = peer.call(userId, stream);
    const videoElement = document.createElement('video');

    call.on('stream', videoStream => {
        addVideoStream(videoElement, videoStream);
    });
    call.on('close', () => {
        videoElement.remove();
    });
    connectedPeers[userId] = call;
};

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
};
