import { meet_init } from "../js/utils.js";

const MeetingScreen = {
    render: () => {
        return `
        <main class="d-flex flex-column home-wrap">
        <div class="ks-top text-light">
            <div class="top-remote-video-show-wrap d-flex">
                <div id="timer"></div>
                <div id="minimize-meet"><i class="fa-solid fa-maximize"></i></div>
                <div id="meetingContainer" style="display: none;">
                    <div class='navigation-bar display-center'>
                        <div class="navigation">
                            <span class="previous"><i class="fas fa-arrow-left"></i></span>
                            <span class="num selected" data-index="1">1</span>
                            <span class="next"><i class="fas fa-arrow-right"></i></span>
                        </div>
                    </div>
                    <div class="call-wrap">
                        <div class="video-wrap" id="divUsers">
                            <div class="gallery-pages" id="page1">
                                <div id="me" class="userbox display-center flex-column">
                                    <div class="display-center circle-tag-my">
                                        <img src="" alt="">
                                    </div>
                                    <h2 class="display-center" style="display: none;font-size:14px ;">
                                    </h2>
                                    <div class="display-center myVideoPlayer" style="display: none;">
                                        <video autoplay muted id="localVideoPlayer">
                                        </video>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="g-right-details-wrap conversation hide">
                    <div class="chat-heading">Chat Messages</div>
                    <div class="chat-message-show conversation-container" id="messages"></div>
                    <div class="chat-message-send">
                        <div class="chat-message-send-input">
                            <input type="text" name="" class="chat-message-input-field" id="msgBox" placeholder="Message">
                            <div class="emoji">
                                <img src='./images/smiley-svgrepo-com.svg'></img>
                            </div>
                        </div>
                        <button class="chat-message-send-action" id="btnSend">
                            <div class="circle">
                                <i class="fa-solid fa-paper-plane"></i>
                            </div>
                        </button>
                    </div>
                </div>
                <div class="p-right-details-wrap hide">
                    <div class="details-heading">Participants(1)</div>
                    <div class="details-show" id="participants"></div>
                </div>
            </div>
        </div>
        <div class="ks-bottom text-light d-flex justify-content-between align-items-center">
            <div class="bottom-left d-flex" style="height:7.5vh">
                <div class="display-center cursor-pointer-c meeting-details-button">
                    Meeting Details<span class="material-icons">keyboard_arrow_down</span>
                </div>
            </div>
            <div class="bottom-middle d-flex align-items-center justify-content-center" style="height: 7.6vh;">
                <div class="mic-toggle-wrap display-center" id="micMuteUnmute">
                    <span class="material-icons">mic_off</span>
                </div>
                <div class="video-toggle-wrap display-center" id="videoCamOnOff">
                    <span class="material-icons">videocam_off</span>
                </div>
                <div class="end-call-wrap action-icon-style display-center cursor-pointer">
                    <span class="material-icons text-danger">call</span>
                </div>
                <div class="top-left-participant-wrap participant-action-icon-style display-center cursor-pointer-p">
                    <div class="top-left-participant-icon">
                        <span class="material-icons">people</span>
                    </div>
                    <div class="top-left-participant-count">1
                    </div>
                </div>
                <div class="top-left-chat-wrap action-icon-style display-center cursor-pointer-m">
                    <span class="material-icons">message</span>
                    <span class="badge">3</span>
                </div>
                <div class="top-left-hand-wrap action-icon-style display-center">
                    <span class="material-icons">back_hand</span>
                </div>
                <div class="whiteboard-wrap action-icon-style display-center">
                    <span class="material-icons" id="drawBoard">draw</span>
                </div>
            </div>
            <div class="bottom-right d-flex justify-content-center align-items-center" style="height:7.5vh">
                <div class="present-now-wrap d-flex justify-content-center flex-column align-items-center cursor-pointer-s"
                    id="ScreenShareOnOff">
                    <span class="material-icons" style="font-size: 30px;">present_to_all</span>
                    <div style="color: white; font-size: 15px;">Present Now</div>
                </div>
                <div class="option-wrap cursor-pointer-c display-center" style="position: relative;">
                    <div class="option-icon">
                        <span class="material-icons">more_vert</span>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <div class="center justify-content-between align-items-center">
        <div>
            <div style="padding-bottom: 1rem;">Enter your Name</div>
        </div>
        <div>
            <div style="padding-bottom: 0.5rem;">
                <input class="user_id_login" id="user_login" type="text" placeholder=""
                    style="border: none; background-color: rgb(47, 47, 47); color: rgb(157, 179, 196); text-align: center;">
                <div class="typeWriterCheck" style="font-size:1rem; color:rgb(9, 150, 150);">Is this fine ?</div>
            </div>
        </div>
        <div>
            <span class="fa-solid fa-circle-chevron-down login-action"
                style="margin-left: 0.5rem;font-size:larger; color: tomato; cursor: pointer; padding-bottom: 1.2rem;"></span>
        </div>
    </div>
        `
    },
    after_render: meet_init
}

export default MeetingScreen;