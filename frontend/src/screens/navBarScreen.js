import { getUserProfile, refreshUser, signout } from '../api.js';
import { clearUser, delMeetings, getUserInfo, setUserInfo } from '../localStorage.js';

const navBarScreen = {
    render: async () => {
        let localUser = getUserInfo();
        let { name, email, _id, personalMeetingId, isProfilePic, profileUrl} = localUser;

        if (name !== '' && email !== '' && _id !== '') {
            const userData = await getUserProfile();
            if (userData.error?.code == 401) {
                const tokens = await refreshUser();
                if (tokens.error) {
                    clearUser();
                    delMeetings();
                    google.accounts.id.disableAutoSelect();
                    name='';
                    email='';
                    personalMeetingId=''
                } else {
                    localUser.token = tokens.access.token;
                    localUser.refresh = tokens.refresh.token;
                    setUserInfo(localUser);
                }
            }
        }

        return `
        <img src="./images/collabx.png" class="logo" alt="">
        <a href="/" class="navbar-brand text-light">CollabX</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <a href="/price.html" class="nav-link">Plan and Price</a>
                </li>
            </ul>
            <ul class="navbar-nav mr-0">
                <li class="nav-item sign-in display-center">
                ${name ? `<a class="nav-link nav-link-profile">${isProfilePic ?`<img src="${profileUrl}" height="48" width="48" alt="">`:`<img src="https://eu.ui-avatars.com/api?name=${name}&size=48&background=random&rounded=true" alt="">`}</a>
                <div class="sub-menu-wrap">
                    <div class="sub-menu">
                        <div class="user-info">
                            <div class="flex-child2">
                                <p>${name}</p>
                                <p>${email}</p>
                            </div>
                            <div class="flex-child1">
                            ${isProfilePic ?`<img src="${profileUrl}"  height="48" width="48" alt="">`:`<img src="https://eu.ui-avatars.com/api?name=${name}&size=48&background=random&rounded=true" alt="">`}
                            </div>
                        </div>
                        <hr>
                        <p class="menu-link">My DashBoard</p>
                        <p id="signout-link" class="menu-link">Sign Out</p> 
                    </div>
                </div>
                ` : '<a href="/signup" class="nav-link nav-link-signin">Sign In</a>'}
                </li>
                <li class="nav-item meeting-control">
                    <button class="btn btn-lg btn-outline-primary font-weight-bold join-meeting">Join the meeting</button>
                </li>
            </ul>
        </div>
        `;
    },
    after_render: () => {
        document.getElementsByClassName('menu-link')[0]?.addEventListener('click', () => {
            window.location.href = '/dashboard';
        });

        document.getElementById('signout-link')?.addEventListener('click', async () => {
            await signout();
            google.accounts.id.disableAutoSelect();
            window.location.href = '/';
        });
    },
};

export default navBarScreen;
