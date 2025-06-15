import { signout, updateProfile, uploadProductImage } from "../api.js";
import { getDateAndTime, setMeetingAndRedirect } from "../js/utils.js";
import { clearUser, getMeetings, getUserInfo, setUserInfo } from "../localStorage.js";

const dashboardScreen = {
    pre_render: async () => {
        let localUser = getUserInfo();
        const { name, email, _id } = localUser;

        if (name === '' || email === '' || _id === '') {
            window.location.href = '/';
            return false;
        } else {
            return await setMeetingAndRedirect(localUser);
        }
    },
    render_dashboard_nav: () => {
        const { name, email, isProfilePic, profileUrl } = getUserInfo();
        return `
        <img src="images/ks_meet_logo.png" class="logo" alt="">
        <a href="/" class="navbar-brand text-light">KS Meet</a>
        <span id="seperator">|</span>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <a class="nav-link active" href="#">Meetings<span class="sr-only">(current)</span></a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Chats</a>
                </li>
            </ul>
            <li class="nav-item sign-in display-center">
                <a class="nav-link nav-link-profile">
                ${isProfilePic ? `<img src="${profileUrl}" alt="">` : `<img src="https://eu.ui-avatars.com/api?name=${name}&size=48&background=random&rounded=true" alt="">`}
                </a>
                <div class="sub-menu-wrap">
                    <div class="sub-menu">
                        <div class="user-info">
                            <div class="flex-child2">
                                <p>${name}</p>
                                <p>${email}</p>
                            </div>
                            <div class="flex-child1">
                            ${isProfilePic ? `<img src="${profileUrl}"  height="48" width="48" alt="">` : `<img src="https://eu.ui-avatars.com/api?name=${name}&size=48&background=random&rounded=true" alt="">`}
                            </div>
                        </div>
                        <hr>
                        <p class="menu-link" id="menu-profile"><img src="./images/cp_profile.png" width="25px" height="25px">&nbsp &nbsp My Profile</p>
                        <p class="menu-link" id="menu-settings"><img src="./images/setting.png" width="25px" height="25px" style="opacity:0.4">&nbsp &nbsp Settings</p>
                        <hr>
                        <p id="signout-link" class="menu-link">Sign Out</p>
                    </div>
                </div>
            </li>
        </div>
        `
    },
    render_body: () => {
        const { name, email, isProfilePic, profileUrl, personalMeetingId, referralCode } = getUserInfo();
        var meetings = getMeetings();
        var pastmeetings = meetings.filter((meet) => (meet.endAt !== undefined));
        var livemeetings = meetings.filter((meet) => (meet.endAt === undefined));
        var i = 1;
        const { date, time } = getDateAndTime();
        return `
            <div class="left-column">
                <div class="card view">
                    <div class="box">Hello, ${name}
                        <div><button type="button" class="btn btn-primary">+ Schedule a Meeting</button></div>
                    </div>
                    <div class="box">
                        <div id="timer">${time}</div>
                        <div>${date}</div>
                    </div>
                </div>
                <div class="card">
                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="home-tab" data-toggle="tab" data-target="#home" type="button" role="tab"
                                aria-controls="home" aria-selected="true">Previous</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="profile-tab" data-toggle="tab" data-target="#profile" type="button" role="tab"
                                aria-controls="profile" aria-selected="false">Upcoming</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="live-tab" data-toggle="tab" data-target="#live" type="button" role="tab"
                                aria-controls="live" aria-selected="false">Live</button>
                        </li>
                    </ul>
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active table-responsive" id="home" role="tabpanel" aria-labelledby="home-tab">
                        ${pastmeetings.length === 0 ?
                `
                            <div><img src="./images/no-meeting.png"></img><p>You are yet to start a meeting<br>All your meetings will appear here</p></div>
                            `
                :
                `
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col">MeetingId</th>
                                        <th scope="col">UserId</th>
                                        <th scope="col">Start Time</th>
                                        <th scope="col">End Time</th>
                                        <th scope="col">View Paricipants</th>
                                    </tr>
                                </thead>
                                <tbody>
                                ${pastmeetings.map((meeting) => {
                    const start = getDateAndTime(meeting.createdAt);
                    const end = getDateAndTime(meeting.endAt)
                    return (
                        `
                                    <tr>
                                    <td>${i++}</td>
                                    <td>${meeting.meetId}</td>
                                    <td>${meeting.userId}</td>
                                    <td>${start.date + ', ' + start.time}</td>
                                    <td>${end.date + ', ' + end.time}</td>
                                    <td><a class="details v_${meeting.id}">Participants</a></td>
                                    </tr>
                                    `
                    )
                }).join('\n')
                }
                                </tbody>
                            </table>
                            `
            }
                        </div>
                        <div class="tab-pane table-responsive fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                            <div><img src="./images/no-meeting.png"></img><p>You are yet to schedule a meeting</p></div>
                        </div>
                        <div class="tab-pane table-responsive fade" id="live" role="tabpanel" aria-labelledby="live-tab">
                        ${livemeetings.length === 0 ?
                `
                            <div><img src="./images/no-meeting.png"></img><p>No meetings going on</p></div>
                            `
                :
                `
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col">MeetingId</th>
                                        <th scope="col">UserId</th>
                                        <th scope="col">Start Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                ${livemeetings.map((meeting) => {
                    const start = getDateAndTime(meeting.createdAt);
                    return (
                        `
                                    <tr>
                                    <td><i class="fa fa-circle text-danger Blink"></i></td>
                                    <td>${meeting.meetId}</td>
                                    <td>${meeting.userId}</td>
                                    <td>${start.date + ', ' + start.time}</td>
                                    </tr>
                                    `
                    )
                }).join('\n')
                }
                                </tbody>
                            </table>
                            `
            }    
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <div class="right-column">
                <div class="card">
                    <h2>About Me</h2>
                    <div class="fakeimg" style="height:100px;">Image</div>
                    <p>Some text about me in culpa qui officia deserunt mollit anim..</p>
                </div>
                <div class="card">
                    <h2>About Me</h2>
                    <div class="fakeimg" style="height:100px;">Image</div>
                    <p>Some text about me in culpa qui officia deserunt mollit anim..</p>
                </div>
            </div>

            <div class="bg-modal">
                <div class="modal-contents">
                    <div class="close">+</div>
                    <div class='left-banner'>
                        <div class="avatar-upload">
                            <div class="avatar-edit">
                                <input type='file' id="imageUpload" accept=".png, .jpg, .jpeg"/>
                                <label for="imageUpload"></label>
                            </div>
                            <div class="avatar-preview">
                                <div id="imagePreview">
                                ${isProfilePic ? `<img id="profile-image1" src="${profileUrl}" alt="">` : `<img id="profile-image1" src="https://eu.ui-avatars.com/api?name=${name}&size=48&background=random&rounded=true" alt="">`}
                                <img class="loader loader-stop" src="./images/loader.png" alt="">
                                </div>
                            </div>
                        </div>
                        <div class="flex-child">
                            <p><b>Name:</b> ${name}</p>
                            <p><b>Email:</b> ${email}</p>
                        </div>
                        <di class="coupon-row">
                          <span id="cpnCode">${referralCode? referralCode:`NoC0DeR1G8T`}<img src="./images/copy.png" alt="🟨"></span>
                          <span id="cpnBtn">Referal Code</span>
                        </di>
                        <div class="star-balance">
                            <p><b>Meeting Hours:</b> 0&nbsp <span style="color:black">⌛️</span></p>
                            <p><b>Star Balance:</b> 0&nbsp <img src="./images/star.svg" alt="⭐️"><p>
                        </div>
                    </div>
                    <div class='right-banner'>
                       <div class="meetingId">
                            <div class="title">Personal Meeting Id</div>
                            <div class="info">${personalMeetingId}</div>
                       </div>
                       <div class="meetingLink">
                            <div class="title">Personal Meeting Link</div>
                            <div class="info">${window.location.host+'/meeting?meetingID='+personalMeetingId} <img src="./images/copy.png" height="25px" width="25px" alt="🟨"></div>
                       </div>
                       <div></div>
                       <div></div>
                    </div>
                </div>
            </div>
        `
    },
    after_render: () => {
        $(document).on('click', '.nav-link-profile', () => {
            $('.nav-link-profile').hide();
            $('.sub-menu-wrap').css({ "visibility": "visible", "opacity": "1", "display": "block" });
        });
        $(document).click(function (e) {
            e.stopPropagation();
            var container = $(".nav-link-profile");
            if (container.has(e.target).length === 0) {
                $('.nav-link-profile').show();
                $('.sub-menu-wrap').css({ "visibility": "", "opacity": "", "display": "none" });
            }
        })

        document.getElementById('signout-link')?.addEventListener('click', async () => {
            await signout();
            google.accounts.id.disableAutoSelect();
            window.location.href = '/';
        });

        setInterval(myTimer, 60000);
        function myTimer() {
            const { time } = getDateAndTime();
            document.getElementById("timer").innerText = time;
        }

        $(document).ready(function () {
            $(".details").click(function () {
                const query = this.className.split(' ')[1].split('_')[1];
                var ret = getMeetings().filter(function (item) {
                    return item.id == query;
                })[0];
                Swal.mixin({
                    customClass: {
                        confirmButton: 'btn btn-success',
                    },
                    buttonsStyling: false
                }).fire({
                    html: `<div class="panel-body">
                                <ul class="list-group">
                                    ${ret.participants.map((pep) => `<li class="list-group-item">${pep === ret.userId ? `${pep} <b>host</b>` : pep}</li>`).join('\n')}
                                </ul>
                            </div>
                          `,
                    backdrop: `
                          rgba(31, 31, 31, 0.687)
                        `,
                    focusConfirm: false,
                })
            });

            $("#imageUpload").change(async function () {
                $('.loader').removeClass('loader-stop');
                var preview = document.querySelector('#profile-image1');
                var file = document.querySelector('input[type=file]').files[0];

                if (file) {
                    const formData = new FormData();
                    formData.append('image', file);
                    const data = await uploadProductImage(formData);
                    if (data.error) {
                        console.log(data.error);
                        return;
                    }
                    const userData = await updateProfile(data.url);
                    if (userData.error) {
                        console.log(data.error);
                        return;
                    }
                    let { token, refresh } = getUserInfo();
                    clearUser();
                    setUserInfo({ ...userData, token, refresh })
                    preview.src = data.url;
                    $('.loader').addClass('loader-stop');
                    console.log('Image uploaded successfully.');
                }
            });

            $("#cpnCode > img").click(function () {
                let copyText = $('#cpnCode').text()
                navigator.clipboard.writeText(copyText);
            })

            $(".meetingLink > .info > img").click(function () {
                let copyText = $('.meetingLink > .info').text()
                navigator.clipboard.writeText(copyText);
            })

        });

        document.getElementById('menu-profile').addEventListener("click", function () {
            document.querySelector('.bg-modal').style.display = "flex";
        });

        document.querySelector('.close').addEventListener("click", function () {
            document.querySelector('.bg-modal').style.display = "none";
        });
    },
};

export default dashboardScreen;