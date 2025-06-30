import { register, signin } from "../api.js";
import { setUserInfo } from "../localStorage.js";

const signUpScreen = {
    render: () => {
        return `
        
        <div class="form-container sign-in-container">
            <form action="" id="signIn-form">
                <h1>Sign in</h1>
                <div id="google-button"></div>
                <br>
                <input type="email" placeholder="Email" id="signEmail" name="email" />
                <input type="password" placeholder="Password" id="signPassword" name="password" />
                <a href="#">Forgot your password?</a>
                <button type="submit">Sign In</button>
            </form>
        </div>
        <div class="overlay-container">
            <div class="overlay">
                <div class="overlay-panel overlay-left">
                    <h1>Welcome Back!</h1>
                    <p>To keep connected with us please login with your personal info</p>
                    <button class="ghost" id="signIn">Sign In</button>
                </div>
                <div class="overlay-panel overlay-right">
                    <h1>Hello, Friend!</h1>
                    <p>Enter your personal details and start journey with us</p>
                    <button class="ghost" id="signUp">Sign Up</button>
                </div>
            </div>
        </div>

        <div class="form-container sign-up-container">
            <form action="" id="register-form">
                <h1>Create Account</h1>
                <br>
                <input type="text" placeholder="Name" id="name" name="name" />
                <input type="email" placeholder="Email" id="email" name="email" />
                <div style="width:100%;">
                    <input class="float-child1" type="password" placeholder="Password" id="password" name="password" />
                    <div class="float-child2" id="float-child2Id"><span id="toggleBtn"></span></div>
                </div>
                <button type="submit">Sign Up</button>
                <div class="validation">
                    <ul>
                        <li id="char">At least one alphabet</li>
                        <li id="number">At least one number</li>
                        <li id="length">At least 8 characters</li>
                    </ul>
                </div>
            </form>
        </div>
       `
    },
    after_render: () => {
        const signUpButton = document.getElementById('signUp');
        const signInButton = document.getElementById('signIn');
        const container = document.getElementById('container');
        const signUpForm = document.getElementById('register-form');
        const signInForm = document.getElementById("signIn-form");
        const errorBox = document.getElementById('errorBox');
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const pswrd = document.getElementById('password');
        const toggleBtn = document.getElementById('toggleBtn');
        const char = document.getElementById('char');
        const number = document.getElementById('number');
        const length = document.getElementById('length');

        //show hide password
        toggleBtn.onclick = () => {
            if (pswrd.type === 'password') {
                pswrd.setAttribute('type', 'text');
                toggleBtn.classList.add('hide');
            } else {
                pswrd.setAttribute('type', 'password');
                toggleBtn.classList.remove('hide');
            }
        }

        signUpButton.addEventListener('click', () => {
            container.classList.add('right-panel-active');
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove('right-panel-active');
        });

        // gLogin.addEventListener('click', async () => {
        //     let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=0,height=0,left=-1000,top=-1000`;
        //     open('/auth', 'test', params);
        // });

        signUpForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const data = await register({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
            });
            if (data.error) {
                errorBox.innerText = data.error.message;
            } else {
                setUserInfo({ ...data.appuser, token: data.token, refresh: data.refresh });
                const userUrl = `${window.location.origin}/`;
                window.location.replace(userUrl);
            }
        });

        signInForm.addEventListener("submit", async (e) => {
            e.preventDefault(); //not refresh
            const data = await signin({
                email: document.getElementById("signEmail").value,
                password: document.getElementById("signPassword").value
            });
            if (data.error) {
                errorBox.innerText = data.error.message;
            } else {
                setUserInfo({ ...data.appuser, token: data.token, refresh: data.refresh });
                const userUrl = `${window.location.origin}/`;
                window.location.replace(userUrl);
            }
        })

        name.onkeyup = function checkNameNull() {
            var data = this.value;
            if (data === null || data === '') {
                document.getElementById('name').classList.remove('valid');
            } else {
                document.getElementById('name').classList.add('valid');
            }
        }

        email.onkeyup = function checkEmailNull() {
            var data = this.value;
            if (data === null || data === '') {
                document.getElementById('email').classList.remove('valid');
            } else {
                document.getElementById('email').classList.add('valid');
            }
        }

        pswrd.onkeyup = function checkPassword() {
            var data = this.value;
            const charExp = new RegExp('(?=.*[a-zA-Z])');
            let charCheck = false;
            const numExp = new RegExp('(?=.*[0-9])');
            let numCheck = false;
            const lengthExp = new RegExp('(?=.{8,})');
            let lenCheck = false;
            if (charExp.test(data)) {
                char.classList.add('valid');
                charCheck = true;
            } else {
                char.classList.remove('valid');
                charCheck = false;
            }

            if (numExp.test(data)) {
                number.classList.add('valid');
                numCheck = true;
            } else {
                number.classList.remove('valid');
                numCheck = false;
            }

            if (lengthExp.test(data)) {
                length.classList.add('valid');
                lenCheck = true;
            } else {
                length.classList.remove('valid');
                lenCheck = false;
            }

            if (charCheck && numCheck && lenCheck) {
                document.getElementById('password').classList.add('valid');
                document.getElementById('float-child2Id').classList.add('valid');
            } else {
                document.getElementById('password').classList.remove('valid');
                document.getElementById('float-child2Id').classList.remove('valid');
            }
        }
    },
    render_google_login: () => {
        var googleButton = document.getElementById('google-button');

        // function to get response
        async function handleCredentialResponse(response) {
            const responsePayload = decodeJwtResponse(response.credential);
            const data = await register({
                name: responsePayload.given_name,
                email: responsePayload.email,
                googleUser: true,
            });
            if (data.error) {
                errorBox.innerText = data.error.message;
                google.accounts.id.disableAutoSelect();
            } else {
                setUserInfo({ ...data.appuser, token: data.token, refresh: data.refresh });
                const userUrl = `${window.location.origin}/`;
                window.location.replace(userUrl);
            }
            googleButton.style.display = 'none';
        }

        google.accounts.id.initialize({
            // replace your client id below
            client_id: "652158918737-jbgf135pl564lib2n2fpefbeqgsapt9s.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            auto_select: true,
            auto: true
        });
        google.accounts.id.renderButton(
            document.getElementById("google-button"),
            { theme: "filled_blue", size: "medium", width: '200', shape: 'pill' }  // customization attributes
        );
        // also display the One Tap dialog on right side
        // important for auto login
        google.accounts.id.prompt();

        // function to decode the response.credential
        function decodeJwtResponse(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        }
    }
}

export default signUpScreen;