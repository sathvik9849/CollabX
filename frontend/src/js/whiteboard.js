const Whiteboard = {
  _init: (server_socket) => {
    const socket = server_socket
    const canvas = document.getElementById('whiteboard');
    const cursor = document.getElementById('cursor_circle');
    const slider = document.getElementById('myRange');
    const slider_rub = document.getElementById('eraseWidth');
    const whiteboardFsBtn = document.getElementById('whiteboardmaximize');
    const colorPicker = document.getElementById('whiteboardColorPicker');
    const eraser_btn = document.getElementById('whiteboardEraserBtn');

    // initialize white board--start
    const swalBackground = 'rgba(0, 0, 0, 0.7)';
    let isBoardBlack = false;
    let eraseSize; 
    let rubColor;
    const restore_Array = [];
    const other_userArray = [];
    let index = -1;
    let _index = -1;
    let isDown = false;
    let points = [];
    let beginPoint = null;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    tippy('#whiteboardColorPicker', {
      content: 'pick color',
      placement: 'left',
      theme: 'light',
    });

    tippy('#myRange', {
      content: 'choose brush width',
      theme: 'light',
    });

    tippy('#eraseWidth', {
      content: 'choose eraser width',
      theme: 'light',
    });

    tippy('#toggleBg', {
      content: 'toggle theme',
      theme: 'light',
    });

    function setCanvasSize(canvas, height) {
      canvas.style.width = window.innerWidth;
      canvas.style.height = height;
      const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
      canvas.width = window.innerWidth * scale;
      canvas.height = height * scale;
    }

    function drawLine(beginPoint, controlPoint, endPoint) {
      if (eraser_btn.style.color !== 'red') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = slider.value;
        const erase = false;
        socket.emit('update_canvas', {
          _mouseLastx: beginPoint.x,
          _mouseLasty: beginPoint.y,
          _mouseNowx: endPoint.x,
          _mouseNowy: endPoint.y,
          _controlx: controlPoint.x,
          _controly: controlPoint.y,
          _color: colorPicker.value,
          _strokeWidth: slider.value,
          _erase: erase,
        });
        ctx.beginPath();
        ctx.moveTo(beginPoint.x, beginPoint.y);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
        ctx.stroke();
        ctx.closePath();
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        const erase = true;
        ctx.lineCap = 'round';
        if (eraseSize === undefined) {
          ctx.lineWidth = 10;
        } else {
          ctx.lineWidth = eraseSize;
        }
        const eraser_width = ctx.lineWidth;
        socket.emit('update_canvas', {
          _mouseLastx: beginPoint.x,
          _mouseLasty: beginPoint.y,
          _mouseNowx: endPoint.x,
          _mouseNowy: endPoint.y,
          _controlx: controlPoint.x,
          _controly: controlPoint.y,
          _color: rubColor,
          _strokeWidth: eraser_width,
          _erase: erase,
        });
        ctx.beginPath();
        ctx.moveTo(beginPoint.x, beginPoint.y);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
        ctx.stroke();
        ctx.closePath();
      }
    }

    function setColor(value) {
      colorPicker.value = value;
    }

    function clear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit('store canvas', canvas.toDataURL());
    }

    function whiteboardClean() {
      Swal.fire({
        background: swalBackground,
        position: 'center',
        title: 'Clean the board',
        text: 'Are you sure you want to clean the board?',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        showClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          clear();
          socket.emit('clean');
        }
      });
    }

    function maximizeme() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        whiteboardFsBtn.className = 'fa-solid fa-minus';
        whiteboardFsBtn.style.backgroundColor = 'goldenrod';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          whiteboardFsBtn.className = 'fa-solid fa-plus';
          whiteboardFsBtn.style.backgroundColor = 'green';
        }
      }
    }

    function getDataTimeString() {
      const d = new Date();
      const date = d.toISOString().split('T')[0];
      const time = d.toTimeString().split(' ')[0];
      return `${date}-${time}`;
    }

    function saveWbCanvas() {
      // Improve it if erase something...
      const link = document.createElement('a');
      link.download = `${getDataTimeString()}WHITEBOARD.png`;
      link.href = canvas.toDataURL();
      link.click();
      link.remove();
    }

    function undoDraw() {
      if (index <= 0) {
        clear();
        restore_Array.splice(0, restore_Array.length);
        index = -1;
      } else {
        index -= 1;
        restore_Array.pop();
        socket.emit('undo_draw', 'undo'); // call socket to undo for other users in meeting
        ctx.putImageData(restore_Array[index], 0, 0);
      }
    }

    document.getElementById('black').onclick = function () { setColor('#000000'); }; // 1
    document.getElementById('red').onclick = function () { setColor('#e74c3c'); }; // 2
    document.getElementById('yellow').onclick = function () { setColor('#f1c40f'); }; // 3
    document.getElementById('green').onclick = function () { setColor('#badc58'); }; // 4
    document.getElementById('blue').onclick = function () { setColor('#3498db'); }; // 5
    document.getElementById('orange').onclick = function () { setColor('#e67e22'); }; // 6
    document.getElementById('darkgreen').onclick = function () { setColor('#007000'); }; // 7
    document.getElementById('pink').onclick = function () { setColor('#fd79a8'); }; // 8
    document.getElementById('brown').onclick = function () { setColor('#834c32'); }; // 9
    document.getElementById('grey').onclick = function () { setColor('#afadad'); }; // 10

    colorPicker.onchange = function () {
      const color = colorPicker.value;
      setColor(color);
    };

    eraser_btn.onclick = function () {
      if (eraser_btn.style.color !== 'red') {
        eraser_btn.style.color = 'red';
        eraser_btn.style.fontSize = '1.5rem';
      } else {
        cursor.style.display = 'none';
        if (canvas.style.backgroundColor === 'rgb(0, 0, 0)') {
          eraser_btn.style.color = 'rgb(0, 0, 0)';
        } else {
          eraser_btn.style.color = 'rgb(255, 255, 255)';
        }
        eraser_btn.style.fontSize = '1.4rem';
      }
    };

    whiteboardFsBtn.onclick = function () { maximizeme(); };
    document.getElementById('whiteboardCleanBtn').onclick = function () { whiteboardClean(); };
    document.getElementById('whiteboardSaveBtn').onclick = function () { saveWbCanvas(); };
    document.getElementById('undoDrawBtn').onclick = function () { undoDraw(); };
    document.getElementById('toggleBg').onclick = function () {
      if (isBoardBlack) {
        if (eraser_btn.style.color !== 'red') {
          eraser_btn.style.color = '#FFFFFF';
        }
        document.getElementById('whiteboardCleanBtn').style.color = '#FFFFFF';
        document.getElementById('whiteboardSaveBtn').style.color = '#FFFFFF';
        document.getElementById('undoDrawBtn').style.color = '#FFFFFF';
        document.getElementById('toggleBg').className = 'fa-solid fa-toggle-off';
        document.getElementById('toggleBg').style.color = '#FFFFFF';
        document.getElementById('board_name').style.color = '#FFFFFF';
        document.getElementsByClassName('colors-cont')[0].style.backgroundColor = 'hsl(0, 0%, 21%)';
        canvas.style.backgroundColor = '#FFFFFF';
        isBoardBlack = false;
      } else {
        if (eraser_btn.style.color !== 'red') {
          eraser_btn.style.color = '#000000';
        }
        document.getElementById('whiteboardCleanBtn').style.color = '#000000';
        document.getElementById('whiteboardSaveBtn').style.color = '#000000';
        document.getElementById('undoDrawBtn').style.color = '#000000';
        document.getElementById('toggleBg').className = 'fa-solid fa-toggle-on';
        document.getElementById('toggleBg').style.color = '#000000';
        document.getElementById('board_name').style.color = '#000000';
        document.getElementsByClassName('colors-cont')[0].style.backgroundColor = '#FFFFFF';
        canvas.style.backgroundColor = '#000000';
        isBoardBlack = true;
      }
    };

    slider_rub.oninput = function () {
      eraseSize = this.value;
    };

    setCanvasSize(canvas, 2000);
    window.addEventListener('resize', () => setCanvasSize(canvas, 2000));

    function getPos(event) {
      const bounds = canvas.getBoundingClientRect();
      let mousex = event.pageX - bounds.left - scrollX;
      let mousey = event.pageY - bounds.top - scrollY;
      mousex /= bounds.width;
      mousey /= bounds.height;

      mousex *= canvas.width;
      mousey *= canvas.height;
      return {
        x: mousex,
        y: mousey,
      };
    }

    function down(evt) {
      isDown = true;
      const { x, y } = getPos(evt);
      beginPoint = { x, y };
    }

    function move(event) {
      if (eraser_btn.style.color === 'red' && event.target.id === 'whiteboard') {
        const bounds = canvas.getBoundingClientRect();
        const ym = (event.pageY - bounds.top - scrollY + 70);
        cursor.style.display = 'block';
        cursor.style.height = `${eraseSize}px`;
        cursor.style.width = `${eraseSize}px`;
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${ym}px`;
      }

      if (!isDown) return;

      const { x, y } = getPos(event);
      points.push({ x, y });

      if (points.length > 3) {
        const lastTwoPoints = points.slice(-2);
        const controlPoint = lastTwoPoints[0];
        const endPoint = {
          x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
          y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
        };
        drawLine(beginPoint, controlPoint, endPoint);
        beginPoint = endPoint;
      }
    }

    function up(event) {
      socket.emit('store canvas', canvas.toDataURL());
      cursor.style.display = 'none';
      if (event.target.id === 'whiteboard') {
        socket.emit('button_up', 'up');
        restore_Array.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        index += 1;
      }

      if (!isDown) return;
      const { x, y } = getPos(event);
      points.push({ x, y });

      if (points.length > 3) {
        const lastTwoPoints = points.slice(-2);
        const controlPoint = lastTwoPoints[0];
        const endPoint = lastTwoPoints[1];
        drawLine(beginPoint, controlPoint, endPoint);
      }
      beginPoint = null;
      isDown = false;
      points = [];
    }

    // mouse controls
    canvas.addEventListener('mousedown', down, false);
    canvas.addEventListener('mousemove', move, false);
    canvas.addEventListener('mouseup', up, false);

    socket.on('update_canvas', (data) => {
      if (data._erase === true) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.lineCap = 'round';
      ctx.strokeStyle = data._color;
      ctx.lineWidth = data._strokeWidth;
      ctx.beginPath();
      ctx.moveTo(data._mouseLastx, data._mouseLasty);
      ctx.quadraticCurveTo(data._controlx, data._controly, data._mouseNowx, data._mouseNowy);
      ctx.stroke();
      ctx.closePath();
    });

    socket.on('clean', () => {
      clear();
    });

    socket.on('undo_draw', () => {
      if (_index <= 0) {
        clear();
        other_userArray.splice(0, other_userArray.length);
      } else {
        _index -= 1;
        other_userArray.pop();
        ctx.putImageData(other_userArray[_index], 0, 0);
      }
    });

    socket.on('button_up', () => {
      other_userArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      _index += 1;
    });

    socket.on('getCanvas', (url) => {
      const img = new Image();
      function start() {
        ctx.drawImage(img, 0, 0);
      }
      img.onload = start;
      img.src = url;
    });

  }
}

export default Whiteboard;