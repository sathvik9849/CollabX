const onlyCapitalLetters = (str) => {
  let newStr = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i].match(/[A-Z]/)) {
      newStr += str[i];
    }
  }
  if (newStr === '') {
    newStr = str.substr(0, 2).toUpperCase();
  }
  return newStr;
}

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var MyAppProcess = (function () {
  var peers_connection_ids = [];
  var peers_connection = [];
  var remote_vid_stream = [];
  var remote_aud_stream = [];
  var local_div;
  var serverProcess;
  var audio;
  var isAudioMute = true;
  var rtp_aud_senders = [];
  var video_states = {
    None: 0,
    Camera: 1,
    ScreenShare: 2,
  };
  var video_st = video_states.None;
  var videoCamTrack;
  var rtp_vid_senders = [];

  async function _init(SDP_function, my_connid, socket) {
    serverProcess = SDP_function;
    my_connection_id = my_connid;
    eventProcess(socket);
    local_div = document.getElementById('localVideoPlayer');
  }

  function eventProcess(socket) {
    $('#micMuteUnmute').on('click', async function () {
      if (!audio) {
        await loadAudio();
      }
      if (!audio) {
        console.log('Audio permission has not granted');
        return;
      }
      if (isAudioMute) {
        audio.enabled = true;
        $('.circle-tag-my').addClass('pulse-my');
        $('#part_me' + ' ' + 'div:nth-child(3)').children('i').eq(1).removeClass('fa-microphone-slash').addClass('fa-microphone');
        $(this).html(
          "<span class='material-icons'>mic</span>",
        );
        $(this).css({
          background: 'transparent',
          color: 'white',
        });
        updateMediaSenders(audio, rtp_aud_senders, socket);
      } else {
        audio.enabled = false;
        $('.circle-tag-my').removeClass('pulse-my');
        $(this).html(
          "<span class='material-icons'>mic_off</span>",
        );
        $(this).css({
          'background-color': 'red',
          color: 'black',
        });
        socket.emit('mic_off');
        $('#part_me' + ' ' + 'div:nth-child(3)').children('i').eq(1).removeClass('fa-microphone').addClass('fa-microphone-slash');
        removeMediaSenders(rtp_aud_senders);
      }
      isAudioMute = !isAudioMute;
    });
    $('#videoCamOnOff').on('click', async () => {
      if (video_st === video_states.Camera) {
        await videoProcess(video_states.None, socket);
      } else {
        await videoProcess(video_states.Camera, socket);
      }
    });
    $('#ScreenShareOnOf').on('click', async () => {
      if (video_st === video_states.ScreenShare) {
        await videoProcess(video_states.None, socket);
      } else {
        await videoProcess(video_states.ScreenShare, socket);
      }
    });
  }

  async function loadAudio() {
    try {
      var astream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      audio = astream.getAudioTracks()[0];
      audio.enabled = false;
    } catch (e) {
      console.log(e);
    }
  }

  function connection_status(connection) {
    if (
      connection
      && (connection.connectionState === 'new'
        || connection.connectionState === 'connecting'
        || connection.connectionState === 'connected')
    ) {
      return true;
    }
    return false;
  }

  async function updateMediaSenders(track, rtp_senders, socket) {
    // console.log(track)
    // console.log( rtp_senders)
    // console.log(peers_connection_ids)
    for (var con_id in peers_connection_ids) {
      // console.log(connection_status(peers_connection[con_id]))
      if (connection_status(peers_connection[con_id])) {
        if (track.kind === 'audio') {
          socket.emit('mic_on');
        }
        if (rtp_senders[con_id] && rtp_senders[con_id].track) {
          rtp_senders[con_id].replaceTrack(track);
        } else {
          rtp_senders[con_id] = peers_connection[con_id].addTrack(track);
        }
      }
    }
  }

  async function updateaudioMediaSenders(track, connid) {
    if (connection_status(peers_connection[connid])) {
      peers_connection[connid].addTrack(track);
    }
  }

  function removeMediaSenders(rtp_senders) {
    for (var con_id in peers_connection_ids) {
      if (rtp_senders[con_id] && connection_status(peers_connection[con_id])) {
        peers_connection[con_id].removeTrack(rtp_senders[con_id]);
        rtp_senders[con_id] = null;
      }
    }
  }

  function removeVideoStream(rtp_vid_senders) {
    if (videoCamTrack) {
      videoCamTrack.stop();
      videoCamTrack = null;
      local_div.srcObject = null;
      removeMediaSenders(rtp_vid_senders);
    }
  }

  async function videoProcess(newVideoState, socket) {
    if (newVideoState === video_states.None) {
      socket.emit('vid_off');
      $('#part_me' + ' ' + 'div:nth-child(3)').children('i').eq(2).removeClass('fa-video').addClass('fa-video-slash');

      $('#me').find('.circle-tag-my').show();
      $('#me').find('h2').hide();
      $('#me').find('.myVideoPlayer').hide();

      $('#videoCamOnOff').html(
        '<span class="material-icons">videocam_off</span>',
      );
      $('#videoCamOnOff').css({
        'background-color': 'red',
        color: 'black',
      });
      $('#ScreenShareOnOf').html(
        '<span class="material-icons">present_to_all</span><div>Present Now</div>',
      );
      video_st = newVideoState;
      removeVideoStream(rtp_vid_senders);
      return;
    }
    if (newVideoState === video_states.Camera) {
      socket.emit('vid_on');
      $('#part_me' + ' ' + 'div:nth-child(3)').children('i').eq(2).removeClass('fa-video-slash').addClass('fa-video');
      $('#me').find('.circle-tag-my').hide();
      $('#me').find('h2').show();
      $('#me').find('.myVideoPlayer').show();

      $('#videoCamOnOff').html(
        '<span class="material-icons">videocam</span>',
      );
      $('#videoCamOnOff').css({
        background: 'transparent',
        color: 'white',
      });
    }
    try {
      var vstream = null;
      if (newVideoState === video_states.Camera) {
        vstream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1920,
            height: 1080,
          },
          audio: false,
        });
      } else if (newVideoState === video_states.ScreenShare) {
        vstream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: 1920,
            height: 1080,
          },
          audio: false,
        });
        vstream.oninactive = (e) => {
          removeVideoStream(rtp_vid_senders);
          $('#ScreenShareOnOf').html(
            '<span class="material-icons ">present_to_all</span><div >Present Now</div>',
          );
        };
      }
      if (vstream && vstream.getVideoTracks().length > 0) {
        // eslint-disable-next-line prefer-destructuring
        videoCamTrack = vstream.getVideoTracks()[0];
        if (videoCamTrack) {
          local_div.srcObject = new MediaStream([videoCamTrack]);
          updateMediaSenders(videoCamTrack, rtp_vid_senders, socket);
        }
      }
    } catch (e) {
      console.log(e);
      return;
    }
    video_st = newVideoState;
    if (newVideoState === video_states.Camera) {
      $('#me').find('.circle-tag-my').hide();
      $('#me').find('h2').show();
      $('#me').find('.myVideoPlayer').show();

      $('#videoCamOnOff').html(
        '<span class="material-icons">videocam</span>',
      );
      $('#videoCamOnOff').css({
        background: 'transparent',
        color: 'white',
      });
      $('#ScreenShareOnOf').html(
        '<span class="material-icons ">present_to_all</span><div >Present Now</div>',
      );
    } else if (newVideoState === video_states.ScreenShare) {
      $('#videoCamOnOff').html(
        '<span class="material-icons" >videocam_off</span>',
      );
      $('#videoCamOnOff').css({
        'background-color': 'red',
        color: 'black',
      });
      $('#ScreenShareOnOf').html(
        '<span class="material-icons text-success">present_to_all</span><div class="text-success">Stop Present Now</div>',
      );
    }
  }

  var iceConfiguration = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: 'stun:stun1.l.google.com:19302',
      },
    ],
  };

  async function setConnection(connid) {
    var connection = new RTCPeerConnection(iceConfiguration);

    connection.onnegotiationneeded = async function (event) {
      await setOffer(connid);
    };
    connection.onicecandidate = function (event) {
      if (event.candidate) {
        serverProcess(
          JSON.stringify({ icecandidate: event.candidate }),
          connid,
        );
      }
    };
    connection.ontrack = function (event) {
      if (!remote_vid_stream[connid]) {
        remote_vid_stream[connid] = new MediaStream();
      }
      if (!remote_aud_stream[connid]) {
        remote_aud_stream[connid] = new MediaStream();
      }
      if (remote_vid_stream[connid] && event.track.kind === 'video') {
        $(`#${connid} ` + '.circle-tag').hide();
        $(`#${connid} ` + 'h2').show();
        $(`#${connid} ` + '.tag-video').show();
      }

      if (event.track.kind === 'video') {
        remote_vid_stream[connid]
          .getVideoTracks()
          .forEach((t) => remote_vid_stream[connid].removeTrack(t));
        remote_vid_stream[connid].addTrack(event.track);
        var remoteVideoPlayer = document.getElementById(`v_${connid}`);
        remoteVideoPlayer.srcObject = null;
        remoteVideoPlayer.srcObject = remote_vid_stream[connid];
        remoteVideoPlayer.load();
      } else if (event.track.kind === 'audio') {
        remote_aud_stream[connid]
          .getAudioTracks()
          .forEach((t) => remote_aud_stream[connid].removeTrack(t));
        remote_aud_stream[connid].addTrack(event.track);
        var remoteAudioPlayer = document.getElementById(`a_${connid}`);
        remoteAudioPlayer.srcObject = null;
        remoteAudioPlayer.srcObject = remote_aud_stream[connid];
        remoteAudioPlayer.load();
      }
    };
    peers_connection_ids[connid] = connid;
    peers_connection[connid] = connection;
    // console.log(peers_connection_ids)
    // console.log(peers_connection)
    // console.log(audio)

    if (audio !== undefined) { updateaudioMediaSenders(audio, connid); }

    if (
      video_st === video_states.Camera
      || video_st === video_states.ScreenShare
    ) {
      if (videoCamTrack) {
        updateMediaSenders(videoCamTrack, rtp_vid_senders);
      }
    }

    return connection;
  }

  async function setOffer(connid) {
    var connection = peers_connection[connid];
    var offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    serverProcess(
      JSON.stringify({
        offer: connection.localDescription,
      }),
      connid,
    );
  }

  async function SDPProcess(message, from_connid) {
    message = JSON.parse(message);
    if (message.answer) {
      await peers_connection[from_connid].setRemoteDescription(
        new RTCSessionDescription(message.answer),
      );
    } else if (message.offer) {
      if (!peers_connection[from_connid]) {
        await setConnection(from_connid);
      }
      await peers_connection[from_connid].setRemoteDescription(
        new RTCSessionDescription(message.offer),
      );
      var answer = await peers_connection[from_connid].createAnswer();
      await peers_connection[from_connid].setLocalDescription(answer);
      serverProcess(
        JSON.stringify({
          answer,
        }),
        from_connid,
      );
    } else if (message.icecandidate) {
      if (!peers_connection[from_connid]) {
        await setConnection(from_connid);
      }
      try {
        await peers_connection[from_connid].addIceCandidate(
          message.icecandidate,
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function closeConnection(connid) {
    peers_connection_ids[connid] = null;
    if (peers_connection[connid]) {
      peers_connection[connid].close();
      peers_connection[connid] = null;
    }
    if (remote_aud_stream[connid]) {
      remote_aud_stream[connid].getTracks().forEach((t) => {
        if (t.stop) t.stop();
      })
      remote_aud_stream[connid] = null;
    }
    if (remote_vid_stream[connid]) {
      remote_vid_stream[connid].getTracks().forEach((t) => {
        if (t.stop) t.stop();
      })
      remote_vid_stream[connid] = null;
    }
  }

  return {
    async setNewConnection(connid) {
      await setConnection(connid);
    },
    async init(SDP_function, my_connid, socket) {
      await _init(SDP_function, my_connid, socket);
    },
    async processClientFunc(data, from_connid) {
      await SDPProcess(data, from_connid);
    },
    async closeConnectionCall(connid) {
      await closeConnection(connid)
    }
  };
})();

var MyApp = () => {
  var socket = null;
  var color = null;
  var user_id = '';
  var meeting_id = '';
  var encrypted_id = '';
  var received_message_count = 0;
  var perPage = 3;
  var content = document.querySelector(".call-wrap .video-wrap");
  var view = document.querySelector(".call-wrap");
  var previous = document.querySelector(".previous");
  var next = document.querySelector(".next");
  var nums = Array.from(document.querySelectorAll(".num"));
  var lastPageNo = 1;

  nums[0].addEventListener("click", function () { //1st page cant be ever empty and not removed anytime
    document.querySelector(".selected").classList.remove("selected");
    nums[0].classList.add("selected");
    content.style.transform = `translateX(${nums.indexOf(nums[0]) * -view.offsetWidth}px)`;
  });

  function initPaging() {
    next.addEventListener("click", function () {
      let current = document.querySelector(".selected");
      if (nums.indexOf(current) + 1 < nums.length) {
        current.classList.remove("selected");
        current.nextElementSibling.classList.add("selected");
        content.style.transform = `translateX(${current.dataset.index * -view.offsetWidth
          }px)`;
      }
    });
    previous.addEventListener("click", function () {
      let current = document.querySelector(".selected");
      if (nums.indexOf(current) > 0) {
        current.classList.remove("selected");
        content.style.transform = `translateX(${(current.dataset.index - 2) * -view.offsetWidth
          }px)`;
        current.previousElementSibling.classList.add("selected");
      }
    });
  }

  function init(uid, mid, eid) {
    initPaging();
    user_id = uid;
    meeting_id = mid;
    encrypted_id = eid;
    color = getRandomColor();
    $('#meetingContainer').show();
    $('#me h2').text(`${user_id}(Me)`);
    $('#me .circle-tag-my img').attr('src', `https://eu.ui-avatars.com/api?name=${onlyCapitalLetters(user_id)}&size=256&background=${color}&rounded=true`);
    $('#participants').append(
      `<div id="part_me" class='participant-list-items'>
          <div class='user_avtar'><img src='https://eu.ui-avatars.com/api?name=${onlyCapitalLetters(user_id)}&size=28&background=${color}&rounded=true'></img></div>
          <div class='user_name'>${user_id}(You)</div>
          <div class='user_action'><i class="fa-solid fa-hand"></i><i class="fa-solid fa-microphone-slash"></i><i class="fa-solid fa-video-slash"></i></div>
      </div>`);
    document.title = user_id;
    event_process_for_signalling_server(color);
    handRaiseEventHandeling();
    eventHandeling();
  }

  function paginate(user) {
    let oldLastPageNo = lastPageNo;
    lastPageNo = $(`${'#' + 'page'}${lastPageNo}`).children().length === perPage ? lastPageNo + 1 : lastPageNo;
    if (lastPageNo !== oldLastPageNo) {
      $('#divUsers').append(`<div class='gallery-pages' id='page${lastPageNo}'></div>`);
      let num = document.createElement("span");
      num.className = "num";
      num.id = "num" + lastPageNo;
      num.dataset.index = lastPageNo;
      num.textContent = lastPageNo;
      next.before(num);
      nums.push(num);
      num.addEventListener("click", function () {
        document.querySelector(".selected").classList.remove("selected");
        num.classList.add("selected");
        content.style.transform = `translateX(${nums.indexOf(num) * -view.offsetWidth
          }px)`;
      });
    }
    $(`${'#' + 'page'}${lastPageNo}`).append(user);
  }

  function arrangePages(userBox) {
    var currNum = parseInt(document.querySelector(".num.selected").dataset.index);
    $('.gallery-pages').remove();
    $('.num').remove();
    nums = [];
    var currpage = 0;
    var total = userBox.length;
    for (let u = 1; u <= total; u++) {
      if (Math.ceil(u / perPage) == currpage) {
        $(`${'#' + 'page'}${currpage}`).append(userBox[u - 1]);
      } else {
        currpage++;
        $('#divUsers').append(`<div class='gallery-pages' id='page${currpage}'></div>`);
        $(`${'#' + 'page'}${currpage}`).append(userBox[u - 1]);
        let num = document.createElement("span");
        if (currpage === currNum) {
          num.className = "num selected";
        } else {
          num.className = "num";
        }
        num.id = "num" + currpage;
        num.dataset.index = currpage;
        num.textContent = currpage;
        next.before(num);
        nums.push(num);
        num.addEventListener("click", function () {
          document.querySelector(".selected").classList.remove("selected");
          num.classList.add("selected");
          content.style.transform = `translateX(${nums.indexOf(num) * -view.offsetWidth
            }px)`;
        });
      }
    }
    if (currpage === currNum - 1) {
      $(`${'#' + 'num'}${currpage}`).removeClass().addClass('num selected');
      content.style.transform = `translateX(${(currpage - 1) * -view.offsetWidth
      }px)`;
    }
    lastPageNo = currpage;
  }

  function addUser(other_user_id, connId, color, userNum) {
    var newDivId = $(`<div id="otherTemplate" class="userbox display-center flex-column" style="display:none">
                          <div class="display-center circle-tag">
                              <img src="" alt="">
                          </div>
                          <h2 class="display-center" style="font-size:14px;display: none;">
                          </h2>
                          <div class="display-center tag-video" style="display: none;">
                              <video autoplay muted></video>
                              <audio autoplay controls style="display:none"></audio>
                          </div>
                      </div>`).clone();
    newDivId = newDivId.attr('id', connId).addClass('other');
    newDivId.find('.circle-tag').attr('id', `i_${connId}`);
    newDivId.find('h2').text(other_user_id);
    newDivId.find('video').attr('id', `v_${connId}`);
    newDivId.find('audio').attr('id', `a_${connId}`);
    newDivId.find(`${'#' + 'i_'}${connId}`).find('img').attr('src', `https://eu.ui-avatars.com/api?name=${onlyCapitalLetters(other_user_id)}&size=256&background=${color}&rounded=true`);
    newDivId.show();
    newDivId.find('.tag-video').find('video').css({ width: '95%', border: '1px solid gray', height: 'auto' });
    paginate(newDivId);
    $('#participants').append(
      `<div id='part_${connId}' class='participant-list-items'>
          <div class='user_avtar'><img src='https://eu.ui-avatars.com/api?name=${onlyCapitalLetters(other_user_id)}&size=28&background=${color}&rounded=true'></img></div>
          <div class='user_name'>${other_user_id}</div>
          <div class='user_action'><i class="fa-solid fa-hand"></i><i class="fa-solid fa-microphone-slash"></i><i class="fa-solid fa-video-slash"></i></div>
      </div>`);
    document.querySelector('.top-left-participant-count').innerHTML = userNum;
    document.querySelector('.details-heading').innerHTML = `Participants(${userNum})`;
  }

  function event_process_for_signalling_server(avatar_color) {
    socket = io.connect('https://collabx-backend-pxhm.onrender.com', { transports: ['websocket'] })

    var SDP_function = function (data, to_connid) {
      socket.emit('SDPProcess', {
        message: data,
        to_connid,
      });
    };

    var adjust_video_width = function (users) {
      var myVideoPlayer = document.getElementById('localVideoPlayer');
      if (users === 1) {
        myVideoPlayer.style.width = '85%';
      } else {
        myVideoPlayer.style.width = '95%';
      }
    }

    socket.on('connect', () => {
      if (socket.connected) {
        MyAppProcess.init(SDP_function, socket.id, socket);
        if (user_id !== '' && meeting_id !== '') {
          socket.emit('userconnect', {
            displayName: user_id,
            meetingid: meeting_id,
            color: avatar_color,
            encrypted_id
          });
          document.getElementById('board_name').innerHTML = `${user_id}'s &nbsp Whiteboard`;
          socket.emit('getCanvas');
        }
      }
    });

    socket.on("inform_others_about_disconnected_user", (data) => {
      adjust_video_width(data.userNum);
      $("#" + data.connId).remove();
      $('.top-left-participant-count').text(data.userNum);
      document.querySelector('.details-heading').innerHTML = `Participants(${data.userNum})`;
      $('#part_' + data.connId + '').remove();
      arrangePages($(".userbox:not(#otherTemplate)"));
      MyAppProcess.closeConnectionCall(data.connId);
    })

    socket.on('inform_others_about_me', (data) => {
      addUser(data.other_user_id, data.connId, data.avatar_color, data.userNumber);
      adjust_video_width(data.userNumber);
      MyAppProcess.setNewConnection(data.connId);
    });

    socket.on('inform_me_about_other_user', (other_users) => {
      var userNumber = other_users.length + 1;
      adjust_video_width(userNumber);
      if (other_users) {
        for (var i = 0; i < other_users.length; i++) {
          addUser(
            other_users[i].user_id,
            other_users[i].connectionId,
            other_users[i].avatar_color,
            userNumber
          );
          MyAppProcess.setNewConnection(other_users[i].connectionId);
        }
      }
    });

    socket.on('SDPProcess', async (data) => {
      await MyAppProcess.processClientFunc(data.message, data.from_connid);
    });

    socket.on('showChatMessageEvent', (data) => {
      received_message_count++;
      const badge = document.querySelector('.badge');
      badge.style.display = 'block';
      if ($('.g-right-details-wrap').hasClass('show')) {
        badge.style.display = 'none';
        received_message_count = 0;
      }
      badge.innerHTML = received_message_count;
      var time = new Date();
      time = time.toLocaleString("en-US", {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      var hero = '';
      if (data.message.length == 2 || data.message.length == 3) {
        if (data.message.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g) !== null && data.message.match(".*[a-zA-Z]+.*") == null)
          hero = 'big';
      }
      var div = $("<div>").addClass(`message received ${hero}`).html(
        '<span class="metaname">' +
        '<span class="u-name">~' + data.from + '</span>' +
        '</span>' +
        data.message +
        '<span class="metadata">' +
        '<span class="time">' + time + '</span>' +
        '</span>');
      $("#messages").append(div);
    })

    socket.on('mic_on', (con_id) => {
      $(`${'#' + 'i_'}${con_id}`).addClass('pulse-other');
      $('#part_' + con_id + ' ' + 'div:nth-child(3)').children('i').eq(1).removeClass('fa-microphone-slash').addClass('fa-microphone');
    });

    socket.on('mic_off', (con_id) => {
      $(`${'#' + 'i_'}${con_id}`).removeClass('pulse-other');
      $('#part_' + con_id + ' ' + 'div:nth-child(3)').children('i').eq(1).removeClass('fa-microphone').addClass('fa-microphone-slash');
    });

    socket.on('vid_off', (con_id) => {
      $(`#${con_id} ` + '.circle-tag').show();
      $(`#${con_id} ` + 'h2').hide();
      $(`#${con_id} ` + '.tag-video').hide();
      $('#part_' + con_id + ' ' + 'div:nth-child(3)').children('i').eq(2).removeClass('fa-video').addClass('fa-video-slash');
    });

    socket.on('vid_on', (con_id) => {
      $('#part_' + con_id + ' ' + 'div:nth-child(3)').children('i').eq(2).removeClass('fa-video-slash').addClass('fa-video');
    });

    socket.on('hand-lower', (con_id) => {
      $('#part_' + con_id + ' ' + 'div:nth-child(3) ' + '.fa-hand').css('visibility', 'hidden');
    })

    socket.on('hand-raise', (con_id) => {
      $('#part_' + con_id + ' ' + 'div:nth-child(3) ' + '.fa-hand').css('visibility', 'visible');
    })
  }

  function messageHandler() {
    const message = $('#msgBox').val();
    if (message !== '') {
      var hero = '';

      if (message.length == 2 || message.length == 3) {
        if (message.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g) !== null && message.match(".*[a-zA-Z]+.*") == null)
          hero = 'big';
      }
      socket.emit('sendMessage', message);
      var time = new Date();
      time = time.toLocaleString("en-US", {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      var div = $("<div>").addClass(`message sent ${hero}`).html(
        '<span class="metaname">' +
        '<span class="u-name">~' + user_id + '</span>' +
        '</span>' +
        message +
        '<span class="metadata">' +
        '<span class="time">' + time + '</span>' +
        '</span>');
      $("#messages").append(div);
      $('#msgBox').val('');
      var conversation = document.querySelector('.conversation-container');
      conversation.scrollTop = conversation.scrollHeight;
    }
  }

  function eventHandeling() {
    $('#btnSend').on('click', () => {
      messageHandler();
    })

    $('#msgBox').on('keypress', (e) => {
      if (e.key === 'Enter') {
        messageHandler();
      }
    })

  }

  function handRaiseEventHandeling() {
    $('.top-left-hand-wrap' + ' ' + 'span:nth-child(1)').on('click', () => {
      $('.top-left-hand-wrap' + ' ' + 'span:nth-child(1)').toggleClass('hand-active');
      var hand = $('#part_me' + ' ' + 'div:nth-child(3) ' + '.fa-hand');
      if (hand.css('visibility') === 'visible') {
        hand.css('visibility', 'hidden');
        socket.emit('hand-lower');
      } else {
        hand.css('visibility', 'visible');
        socket.emit('hand-raise');
      }
    });
  }

  return {
    _init(uid, mid, eid) { //bid --meeting encryption id
      init(uid, mid, eid);
      return socket;
    }
  };
};
