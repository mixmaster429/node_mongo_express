const ICE_SERVERS = [
	{ urls: "stun:stun.l.google.com:19302" },
	{ urls: "stun:stun.stunprotocol.org:3478" },
	{ urls: "stun:stun.sipnet.net:3478" },
	{ urls: "stun:stun.ideasip.com:3478" },
	{ urls: "stun:stun.iptel.org:3478" },
	{ urls: "turn:numb.viagenie.ca", username: "imvasanthv@gmail.com", credential: "d0ntuseme" },
	{
		urls: [
			"turn:173.194.72.127:19305?transport=udp",
			"turn:[2404:6800:4008:C01::7F]:19305?transport=udp",
			"turn:173.194.72.127:443?transport=tcp",
			"turn:[2404:6800:4008:C01::7F]:443?transport=tcp",
		],
		username: "CKjCuLwFEgahxNRjuTAYzc/s6OMT",
		credential: "u1SQDR/SQsPQIxXNWQT7czc/G4c=",
	},
];

const ChatHistory = require('./models/chathistory');
const socketio = require('socket.io');
const channels = {};
const sockets = {};

const bot = {
  user_id: 0,
  username: 'Bot',
  avatar: 'assets/img/logo.png',
}
var users = [];
var videos = [];

function initSocket(server) {
  const io = socketio(server, {
    cors: {
      origin: 'http://localhost:4200',
      credentials: true
    }
  });
  io.on('connection', socket => {

    const socketHostName = socket.handshake.headers.host.split(":")[0];
    
    socket.channels = {};
    sockets[socket.id] = socket;
    console.log("[" + socket.id + "] connection accepted");
    
    socket.on('join', ({
      user_id,
      username,
      avatar,
      room
    }) => {
      const user = userJoin(socket.id, user_id, username, avatar, room);
      users = getRoomUsers(user.room);

      socket.join(user.room);
      // socket.emit('message', formatMessage(bot, 'Welcome to Thundersms!'));
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(bot, `${user.username} has joined the chat`)
        );

      // Send users and room info
      // io.to(user.room).emit('join', {
      //   room: user.room,
      //   users: getRoomUsers(user.room)
      // });

      // xx
      console.log("[" + socket.id + "] join ", user_id);
      const channel = socketHostName + room;

      // Already Joined
      if (channel in socket.channels) return;

      if (!(channel in channels)) {
        channels[channel] = {};
      }

      for (const id in channels[channel]) {
        channels[channel][id].emit('join', { user: user, should_create_offer: false });
        socket.emit('join', { user: getCurrentUser(id), should_create_offer: true });
      }

      channels[channel][socket.id] = socket;
      socket.channels[channel] = channel;
    });

    // Listen for message
    socket.on('message', msg => {
      const user = getCurrentUser(socket.id);
      let chat_log = formatMessage(user, msg);
      ChatHistory.create(chat_log);
      
      io.to(user.room).emit('message', chat_log);
    });

    socket.on('relayICECandidate', (config) => {
      let peer_id = config.peer_id;
      let ice_candidate = config.ice_candidate;
      console.log("[" + socket.id + "] relay ICE-candidate to [" + peer_id + "] ", ice_candidate);
  
      if (peer_id in sockets) {
        const user = getCurrentUser(socket.id);
        sockets[peer_id].emit("iceCandidate", { user: user, ice_candidate: ice_candidate });
      }
    });
  
    socket.on('relaySessionDescription', (config) => {
      let peer_id = config.peer_id;
      let session_description = config.session_description;
      console.log("[" + socket.id + "] relay SessionDescription to [" + peer_id + "] ", session_description);
  
      if (peer_id in sockets) {
        const user = getCurrentUser(socket.id);

        sockets[peer_id].emit("sessionDescription", {
          user: user,
          session_description: session_description,
        });
      }
    });

    socket.on('full_room', msg => {
      socket.emit('room_full', msg);
    });

    socket.on('stream', msg => {
      const user = getCurrentUser(socket.id);
      if(user && user.room)
        socket.broadcast.to(user.room).emit('stream', msg);
    });

    const part = (channel) => {
      // Socket not in channel
      if (!(channel in socket.channels)) return;
  
      delete socket.channels[channel];
      delete channels[channel][socket.id];
  
      for (const id in channels[channel]) {
        channels[channel][id].emit("removePeer", { peer_id: socket.id });
        socket.emit("removePeer", { peer_id: id });
      }
    };

    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(bot, `${user.username} has left the chat`)
        );
        // io.to(user.room).emit('userLeave', {
        //   user: user
        // });
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
      
      // xx
      for (const channel in socket.channels) {
        part(channel);
      }
      console.log("[" + socket.id + "] disconnected");
      delete sockets[socket.id];
    });

    socket.on('endcall', () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(bot, `${user.username} has left the chat`)
        );
        io.to(user.room).emit('userLeave', {
          user: user
        });
      }
      
      // xx
      for (const channel in socket.channels) {
        part(channel);
      }
      console.log("[" + socket.id + "] disconnected");
      delete sockets[socket.id];
    });
  });
}

// Join user to meeting
function userJoin(id, user_id, username, avatar, room) {
  console.log(user_id)
  const user = {
    id,
    user_id,
    username,
    avatar,
    room
  };

  if (!users.some(e => e.user_id == user_id && e.room == room))
    users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function formatMessage(user, text) {
  return {
    text: text,
    date: new Date(),
    reply: true,
    type: 'text',
    files: [],
    user: user,
  };
}


module.exports = {
  initSocket
}