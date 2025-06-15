import { addMeeting, getMyMeetings, refreshUser, signout } from '../api.js';
import { clearUser, getUserInfo, setMeetings, setUserInfo } from '../localStorage.js';
import { typeWriter } from './type.js';
import Whiteboard from './whiteboard.js';

class TypeWriter {
    constructor(txtElement, words, wait = 2000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.type();
        this.isDeleting = false;
    }
    // Type Method
    type() {
        // current index
        const current = this.wordIndex % this.words.length;
        // get full word
        const fullTxt = this.words[current];

        // check if deleting
        if (this.isDeleting) {
            // Remove char
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            // add a char
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }
        // Insert TXT into element
        this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;

        // TypeSpeed
        let typeSpeed = 100;
        if (this.isDeleting) {
            typeSpeed /= 2;
        }
        document.getElementById('cursor').style.animation = '';
        document.getElementById('cursor').style.animationDuration = '';
        document.getElementById('cursor').style.animationIterationCount = '';

        // If word is complete
        if (!this.isDeleting && this.txt === fullTxt) {
            document.getElementById('cursor').style.animation = 'blinks';
            document.getElementById('cursor').style.animationDuration = '0.5s';
            document.getElementById('cursor').style.animationIterationCount = 'infinite';
            // make pause at end
            typeSpeed = this.wait;

            // Set delete to true
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            document.getElementById('cursor').style.animation = '';
            document.getElementById('cursor').style.animationDuration = '';
            document.getElementById('cursor').style.animationIterationCount = '';
            this.isDeleting = false;
            // eslint-disable-next-line no-plusplus
            this.wordIndex++;
            // Pause before typing new word
            typeSpeed = 250;
        }

        setTimeout(() => {
            this.type();
        }, typeSpeed);
    }
}

const getElementFromId = (id_name) => {
    return document.getElementById(id_name);
}

// InitApp
export const home_init = () => {
    const txtElement = document.querySelector('.txt-type');
    const words = JSON.parse(txtElement.getAttribute('data-words'));
    const wait = txtElement.getAttribute('data-wait');
    // init TypeWriter
    new TypeWriter(txtElement, words, wait);

    document.getElementsByClassName('join-action')[0].style.display = 'none';

    $('.enter_code').on("focus", () => {
        if ($('.enter_code').val() === '') {
            $('.enter-code').css({
                "animation": "shake 0.3s",
                "animation-iteration-count": "1"
            });
            document.getElementsByClassName('join-action')[0].style.display = 'none';
        } else {
            document.getElementsByClassName('join-action')[0].style.display = 'block';
        }
    });

    //meeting-code-typing script
    document.getElementsByClassName('enter_code')[0].addEventListener('input', (e) => {
        const field = document.getElementsByClassName('enter_code')[0];
        if (e.inputType === 'insertFromPaste') {
            var code_regex = /^\d{3}\-\d{3}\-\d{3}$/;
            if (code_regex.test(field.value)) {
                document.getElementsByClassName('join-action')[0].style.display = 'block';
                return;
            }
        }
        const last_char = field.value.slice(field.value.length - 1, field.value.length);
        const invalid = isNaN(last_char) || last_char === ' ';
        if ($('.enter_code').val() !== '' && e.inputType === 'insertText') {
            if (invalid) {
                field.value = field.value.slice(0, field.value.length - 1);
                return;
            }
            const length = field.value.replace(/\-/g, '').length;
            //code to handle dynamic pattern printing
            if (length == 3 && e.inputType === 'insertText') {
                field.value += '-';
            } else if (length == 6 && e.inputType === 'insertText') {
                field.value += '-';
                //to remove back button bug at crtitical point
            } else if ((length == 7 || length == 4) && e.inputType === 'insertText') {
                const str = field.value.slice(field.value.length - 2, field.value.length - 1);
                if (str != '-') {
                    field.value = field.value.slice(0, field.value.length - 1) + '-' + e.data;
                }
            }
            document.getElementsByClassName('join-action')[0].style.display = length === 9 ? 'block' : 'none';
        } else {
            document.getElementsByClassName('join-action')[0].style.display = 'none';
        }
    });

    //jquery for navscreen element
    $(document).on('click', '.join-meeting', () => {
        $('.enter-code').css({
            "animation": "",
            "animation-iteration-count": ""
        });
        $('.enter_code').trigger('focus');
    });

    document.getElementsByClassName('nav-link-profile')[0]?.addEventListener('click', () => {
        $('.nav-link-profile').hide();
        $('.sub-menu-wrap').css({ "visibility": "visible", "opacity": "1", "display": "block" });
    });

    document.addEventListener('click', function (e) {
        e.stopPropagation();
        var container = $(".nav-link-profile");
        if (container.has(e.target).length === 0) {
            $('.nav-link-profile').show();
            $('.sub-menu-wrap').css({ "visibility": "", "opacity": "", "display": "none" });
        }
    })

    document.getElementsByClassName('join-action')[0].addEventListener('click', () => {
        const joinValue = $('.enter_code').val();
        const meetingUrl = `${window.location.origin}/meeting?meetingID=${joinValue}`;
        window.open(meetingUrl, '_blank');
    });
    document.getElementsByClassName('new-meeting')[0].addEventListener('click', () => {
        function genRandomId() {
            const id = Math.random().toString().slice(2, 11);
            return id.substring(0, 3) + '-' + id.substring(3, 6) + '-' + id.substring(6, 9);
        }
        var nineDvalue = genRandomId();
        const signInUserMeetingId = getUserInfo().personalMeetingId;
        if (signInUserMeetingId !== '') {
            nineDvalue = signInUserMeetingId;
        }
        const meetingUrl = `${window.location.origin}/meeting?meetingID=${nineDvalue}`;
        window.open(meetingUrl, '_blank');
    });
}

export const parseRequestUrl = () => {
    const url = document.location.href;
    const request = url.split('/');
    return {
        resource: request[1],
        id: request[2],
        verb: request[3],
    };
};

export const meet_draw_init = () => {
    document.getElementById('whiteboard-cont').style.display = 'none';
    document.getElementsByClassName('ks-bottom')[0].style.visibility = 'hidden';
    document.getElementsByTagName('main')[0].style.opacity = '0.1';
    $('.user_id_login').focus();
    typeWriter();
}

export const meet_init = () => {
    let now_time;
    let user_id = null;
    let meeting_id;
    let urlParams;
    const whiteboardFsBtn = getElementFromId('whiteboardmaximize');

    function checkTime(i) {
        let t = i;
        if (t < 10) { t = `0${t}`; } // add zero in front of numbers < 10
        return t;
    }

    function msToTime(s) {
        let sec = s;
        const ms = sec % 1000;
        sec = (sec - ms) / 1000;
        const secs = sec % 60;
        sec = (sec - secs) / 60;
        const mins = sec % 60;
        const hrs = (sec - mins) / 60;
        return `${checkTime(hrs)}:${checkTime(mins)}:${checkTime(secs)}`;
    }

    function startTimer() {
        const today = new Date();
        const time = today.getTime() - now_time.getTime();
        getElementFromId('timer').innerHTML = msToTime(time);
        setTimeout(startTimer, 1000);
    }

    function toggleText() {
        const isMobile = window.matchMedia('only screen and (max-width: 660px)').matches;
        if (isMobile) {
            Swal.fire({
                background: 'rgba(179, 172, 171, 0.825)',
                icon: 'error',
                title: 'Oops...',
                text: 'Try our desktop version to try whiteboard!',
            });
        } else {
            const x = getElementFromId('whiteboard-cont');
            if (x.style.display === 'none') {
                x.style.display = 'block';
                $('#meetingContainer').hide();
                $('.whiteboard-cont').show();
                $('#stop_wb').show();
                $('#minimize-meet').hide();
                $('#drawBoard').css({
                    'background-color': 'blue',
                    'border-radius': '50%',
                });
            } else {
                x.style.display = 'none';
                getElementFromId('index').style.display = 'block';
                $('#meetingContainer').show();
                $('.whiteboard-cont').hide();
                $('#stop_wb').hide();
                $('#minimize-meet').show();
                if (document.fullscreenElement) {
                    $('#minimize-meet i').removeClass('fa-maximize').addClass('fa-minimize');
                    $('#minimize-meet').css("background-color", "goldenrod");
                    whiteboardFsBtn.className = 'fa-solid fa-minus';
                    whiteboardFsBtn.style.backgroundColor = 'goldenrod';
                } else {
                    $('#minimize-meet i').removeClass('fa-minimize').addClass('fa-maximize');
                    $('#minimize-meet').css("background-color", "green");
                    whiteboardFsBtn.className = 'fa-solid fa-plus';
                    whiteboardFsBtn.style.backgroundColor = 'green';
                }
                $('#drawBoard').css({
                    background: 'transparent',
                });
            }
        }
    }

    function toggleChat() {
        if ($('.p-right-details-wrap').hasClass('show')) {
            $('.p-right-details-wrap').removeClass('show').addClass('show-below');
        }
        $('.g-right-details-wrap').toggleClass('hide show');
        $('.top-left-chat-wrap').toggleClass('cursor-pointer-m cursor-pointer-m-sel');
        if ($('.g-right-details-wrap').hasClass('show')) {
            $('.badge').hide();
        }
    }

    function toggleParticipant() {
        if ($('.p-right-details-wrap').hasClass('show-below')) {
            $('.p-right-details-wrap').removeClass('show-below').addClass('show');
        }
        $('.p-right-details-wrap').toggleClass('hide show');
        $('.top-left-participant-wrap').toggleClass('cursor-pointer-p cursor-pointer-p-sel');
    }

    function delay(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        });
    }

    function fireErrorMessage(message) {
        $('.center').hide();
        Swal.fire({
            background: 'rgba(234, 62, 45, 0.12)',
            icon: 'error',
            title: 'Oops...',
            text: message,
            confirmButtonText: 'OK'
        }).then((result) => {
            if (result.isConfirmed || result.dismiss) {
                window.location.href = '/';
            }
        });
        delay(2000).then(() => {
            window.location.href = '/';
        });
    }

    function fireNewMeeting(id) {
        now_time = new Date();
        startTimer();
        document.getElementsByClassName('ks-bottom')[0].style.visibility = 'visible';
        document.getElementsByTagName('main')[0].style.opacity = '1';
        $('.center').hide();
        $('#meetingContainer').show();
        var socket = MyApp()._init(user_id, meeting_id, id);
        Whiteboard._init(socket);
    }

    async function loginUser() {
        user_id = $('.user_id_login').val();
        if (!user_id || !meeting_id) {
            fireErrorMessage("You didn't entered your name!");
        }

        const localUser = getUserInfo();
        if (localUser.name === '' || localUser.email === '' || localUser._id === '') {
            // user hadn't logged in yet
            fireErrorMessage("Try to Login or Create new account!");
        } else {
            const new_meetings = await addMeeting({
                userId: user_id,
                meetingId: meeting_id,
            });
            if (new_meetings?.error?.message && new_meetings?.error?.code === 401) {
                // auth-token invalid --try to refresh-token
                const tokens = await refreshUser();
                if (tokens.error) {
                    // refresh-token invalid --try to re-login 
                    clearUser();
                    google.accounts.id.disableAutoSelect();
                    fireErrorMessage("Try to Login or Create new account!");
                } else {
                    // refresh-token valid --login
                    localUser.token = tokens.access.token;
                    localUser.refresh = tokens.refresh.token;
                    setUserInfo(localUser);
                    let new_meet = await addMeeting({ userId: user_id, meetingId: meeting_id });
                    fireNewMeeting(new_meet.id);
                }
            } else {
                // no need to refresh ---auth-token valid
                fireNewMeeting(new_meetings.id)
            }
        }

    }

    function callEnd() {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-danger',
                closeButton: 'btn btn-success',
                actions: 'swal2-leave-action',
                popup: 'swal2-leave-popup',
                title: 'swal2-leave-title',
            },
            buttonsStyling: false
        })

        swalWithBootstrapButtons.fire({
            title: 'Leave the meeting',
            html: '<p>Are you sure you want to leave now ?</p>',
            showCloseButton: true,
            confirmButtonText: 'Leave',
        }).then((result) => {
            if (result.isConfirmed) {
                window.close();
            }
        })
    }

    $(document).ready(() => {
        urlParams = new URLSearchParams(window.location.search);
        meeting_id = urlParams.get('meetingID');
        $(document).on('click', '.login-action', loginUser);
        $(document).on('click', '#drawBoard', toggleText);
        $(document).on('click', '#stop_wb', toggleText);
        $(document).on('click', '.top-left-chat-wrap', toggleChat);//top-left-chat-wrap
        $(document).on('click', '.top-left-participant-wrap', toggleParticipant);//top-left-chat-wrap
        $(document).on('click', '.end-call-wrap', callEnd);
        $(document).on('click', '#minimize-meet', () => {
            if ($('#minimize-meet i').hasClass('fa-maximize')) {
                document.documentElement.requestFullscreen();
                $('#minimize-meet i').removeClass('fa-maximize').addClass('fa-minimize');
                $('#minimize-meet').css("background-color", "goldenrod");
                whiteboardFsBtn.className = 'fa-solid fa-minus';
                whiteboardFsBtn.style.backgroundColor = 'goldenrod';
            } else {
                document.exitFullscreen();
                $('#minimize-meet i').removeClass('fa-minimize').addClass('fa-maximize');
                $('#minimize-meet').css("background-color", "green");
                whiteboardFsBtn.className = 'fa-solid fa-plus';
                whiteboardFsBtn.style.backgroundColor = 'green';
            }
        });
        const trigger = document.querySelector('.emoji');
        const view = document.querySelector('.chat-message-send');
        const input = document.querySelector('.chat-message-input-field');
        import('./plugins/picmo.js').then((module) => {
            const picker = module.createPopup({ hideOnEmojiSelect: 0 }, {
                referenceElement: view,
                triggerElement: trigger,
                position: 'top-left'
            });
            picker.addEventListener('emoji:select', (selection) => {
                input.value += selection.emoji;
            });
            trigger.addEventListener('click', () => {
                picker.toggle();
            });
        });
    });
}

export const setMeetingAndRedirect = async (localUser) => {
    const myMeetings = await getMyMeetings();
    if (myMeetings?.error?.code === 401) {
        const tokens = await refreshUser();
        if (tokens.error) {
            await signout();
            google.accounts.id.disableAutoSelect();
            window.location.href = '/';
            return false;
        } else {
            localUser.token = tokens.access.token;
            localUser.refresh = tokens.refresh.token;
            setUserInfo(localUser);
            const updatedMeetings = await getMyMeetings();
            setMeetings(updatedMeetings);
            return true;
        }

    } else {
        setMeetings(myMeetings);
        return true;
    }
}

export const getDateAndTime = (today = new Date()) => {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'];
    var etq = false;
    if (typeof (today) === 'string') {
        etq = true;
        today = new Date(today);
    }
    const time_arr = today.toLocaleTimeString().split(":");
    const AMPM = time_arr[2].split(' ')[1];
    var hours = Number(time_arr[0]);
    if (AMPM == "PM" && hours < 12) hours = hours + 12;
    if (AMPM == "AM" && hours == 12) hours = hours - 12;
    time_arr[0] = hours.toString().length == 1 ? '0' + hours.toString() : hours.toString();
    return {
        date: today.getDate() + `${etq ? `th ` : ` `}` + months[today.getMonth()] + " " + today.getFullYear(),
        time: time_arr[0] + ':' + time_arr[1]
    }
}

export const hideloading = () => {
    getElementFromId('loading-overlay') ? getElementFromId('loading-overlay').style.display = 'none' : '';
}