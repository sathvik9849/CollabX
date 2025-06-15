import { meet_draw_init } from "../js/utils.js";

const WhiteboardScreen = {
    render: () => {
        return `
        <div class="colors-cont">
            <div id="stop_wb">Stop</div>
            <div class="portion1">
                <button id="whiteboardmaximize" class="fa-solid fa-plus"></button>
            </div>
            <div class="portion2 display-center" id="board_name">
            </div>
            <div class="portion3">
                <div>
                    <input type="color" id="whiteboardColorPicker" />
                </div>
                <input id="myRange" style="width: 5rem;" type="range" min="1" max="60" value="2">
                <div class="black" id="black"></div>
                <div class="red" id="red"></div>
                <div class="yellow" id="yellow"></div>
                <div class="green" id="green"></div>
                <div class="blue" id="blue"></div>
                <div class="orange" id="orange"></div>
                <div class="darkgreen" id="darkgreen"></div>
                <div class="pink" id="pink"></div>
                <div class="brown" id="brown"></div>
                <div class="grey" id="grey"></div>
            </div>
            <div class="portion4">
                <button id="whiteboardEraserBtn" class="fas fa-eraser"></button>
                <input id="eraseWidth" style="width: 3rem; margin-left: 0.5rem;" type="range" min="10" max="60"
                    value="2">
                <button id="undoDrawBtn" class="fas fa-undo"></button>
                <button id="whiteboardSaveBtn" class="fas fa-download"></button>
                <button id="whiteboardCleanBtn" class="fas fa-trash-can"></button>
            </div>
            <div class="portion5">
                <button id="toggleBg" class="fa-solid fa-toggle-off"></button>
            </div>
            <div class='cursor_circle' id="cursor_circle"></div>
        </div>
        <div class='whiteboard-container'>
            <canvas id="whiteboard"></canvas>
        </div>
       `
    },
    after_render: meet_draw_init,
}

export default WhiteboardScreen;