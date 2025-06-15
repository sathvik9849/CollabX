const mongoose = require('mongoose');
const logger = require('./config/logger');
const server = require('./server');
const config = require('./config/config');
const MeetingModel = require('./models/meetingModel');

let backend_server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  backend_server = server.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  // socket connection for meet
  const io = require('socket.io')(backend_server, {
    allowEIO3: true,
  });
  // variable initialization
  var userConnections = []; // allconnections
  var rooms_history = {};
  const socketroom = {}; // connections of a romm socket id to meeting id maping
  const roomBoard = {}; // whiteboard data of room
  io.on('connection', (socket) => {
    socket.on('userconnect', (data) => {
      socketroom[socket.id] = data.meetingid;
      if (rooms_history[`${data.meetingid}`] === undefined) {
        rooms_history[`${data.meetingid}`] = [];
      }
      rooms_history[`${data.meetingid}`].push(data.displayName);

      const otherUsers = userConnections.filter((p) => p.meeting_id === data.meetingid);
      userConnections.push({
        connectionId: socket.id,
        user_id: data.displayName,
        meeting_id: data.meetingid,
        encrypted_id: data.encrypted_id,
        avatar_color: data.color
      });
      var userCount = userConnections.length;
      otherUsers.forEach((v) => { // get other users of a room
        socket.to(v.connectionId).emit('inform_others_about_me', {
          other_user_id: data.displayName,
          connId: socket.id,
          avatar_color: data.color,
          userNumber: userCount
        });
      });

      socket.emit('inform_me_about_other_user', otherUsers);
    });

    socket.on('SDPProcess', (data) => {
      socket.to(data.to_connid).emit('SDPProcess', {
        message: data.message,
        from_connid: socket.id,
      });
    });

    socket.on('update_canvas', (data) => { // update canvas for all users of my meeting
      userConnections.forEach((con) => {
        if (con.connectionId !== socket.id && socketroom[socket.id] === con.meeting_id) {
          socket.to(con.connectionId).emit('update_canvas', data);
        }
      });
    });

    socket.on('clean', () => { // clean canvas for all users of my meeting
      userConnections.forEach((con) => {
        if (con.connectionId !== socket.id && socketroom[socket.id] === con.meeting_id) {
          socket.to(con.connectionId).emit('clean');
        }
      });
    });

    socket.on('undo_draw', (data) => { // undo->1 step for canvas of all users of my meeting
      userConnections.forEach((con) => {
        if (con.connectionId !== socket.id && socketroom[socket.id] === con.meeting_id) {
          socket.to(con.connectionId).emit('undo_draw', data);
        }
      });
    });

    socket.on('button_up', () => { // just to control functionality  of undo
      userConnections.forEach((con) => {
        if (con.connectionId !== socket.id && socketroom[socket.id] === con.meeting_id) {
          socket.to(con.connectionId).emit('button_up');
        }
      });
    });

    socket.on('store canvas', (url) => {
      roomBoard[socketroom[socket.id]] = url;
    });

    socket.on('getCanvas', () => {
      userConnections.forEach((con) => { // send canvas data for new users
        if (socketroom[socket.id] === con.meeting_id && roomBoard[socketroom[socket.id]]) {
          socket.emit('getCanvas', roomBoard[socketroom[socket.id]]);
        }
      });
    });

    socket.on('mic_on', () => {
      userConnections.forEach((con) => {
        if (socketroom[socket.id] === con.meeting_id && socket.id !== con.connectionId) {
          socket.to(con.connectionId).emit('mic_on', socket.id);
        }
      });
    });

    socket.on('mic_off', () => {
      userConnections.forEach((con) => {
        if (socketroom[socket.id] === con.meeting_id && socket.id !== con.connectionId) {
          socket.to(con.connectionId).emit('mic_off', socket.id);
        }
      });
    });

    socket.on('vid_off', () => {
      userConnections.forEach((con) => {
        if (socketroom[socket.id] === con.meeting_id && socket.id !== con.connectionId) {
          socket.to(con.connectionId).emit('vid_off', socket.id);
        }
      });
    });

    socket.on('vid_on', () => {
      userConnections.forEach((con) => {
        if (socketroom[socket.id] === con.meeting_id && socket.id !== con.connectionId) {
          socket.to(con.connectionId).emit('vid_on', socket.id);
        }
      });
    });

    socket.on('hand-lower', () => {
      userConnections.forEach((con) => {
        if (socketroom[socket.id] === con.meeting_id && socket.id !== con.connectionId) {
          socket.to(con.connectionId).emit('hand-lower', socket.id);
        }
      });
    });

    socket.on('hand-raise', () => {
      userConnections.forEach((con) => {
        if (socketroom[socket.id] === con.meeting_id && socket.id !== con.connectionId) {
          socket.to(con.connectionId).emit('hand-raise', socket.id);
        }
      });
    });

    socket.on("sendMessage", (msg) => {
      var mUser = userConnections.find((p) => p.connectionId == socket.id);
      if (mUser) {
        var meetingId = mUser.meeting_id;
        var from = mUser.user_id;
        var list = userConnections.filter((p) => p.meeting_id == meetingId);
        list.forEach((v) => {
          socket.to(v.connectionId).emit('showChatMessageEvent', {
            from: from,
            message: msg
          });
        })
      }
    })

    socket.on("disconnect", async () => {
      var disUser = userConnections.find((p) => p.connectionId == socket.id);
      if (disUser) {
        var meetingid = disUser.meeting_id;
        userConnections = userConnections.filter((p) => p.connectionId != socket.id);
        var list = userConnections.filter((p) => p.meeting_id == meetingid);
        list.forEach((v) => {
          var userNumAfterUserLeave = userConnections.length;
          socket.to(v.connectionId).emit("inform_others_about_disconnected_user", {
            connId: socket.id,
            userNum: userNumAfterUserLeave
          });
        })
        await MeetingModel.findByIdAndUpdate(disUser.encrypted_id, { endAt: new Date(), participants: rooms_history[`${meetingid}`] });
        if (list.length == 0) {
          delete rooms_history[`${meetingid}`];
        }
      }
    })
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
