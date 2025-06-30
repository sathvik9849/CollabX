import { home_init } from "../js/utils.js";

const HomeScreen = {
    render: () => {
        return `
        <div class="details d-flex">
            <div class="container1 ">
                <h1>Welcome to <span style="color: #d001bb;">CollabX</span>
                    <div class="contain">
                        <h1 class="h1style">Let's&nbsp;
                            <span class="txt-type" data-wait="2000"
                                data-words='["meet!!🤝","collaborate!!🤗","have some fun!!😃"]'></span>
                            <b class="cursor" id="cursor">|</b>
                        </h1>
                    </div>
                </h1>
                <hr>
                <p style="font-size:20px;">CollabX is designed for secure personal meetings and making it free
                    for everyone to use.
                </p>
                <ul class="display-center justify-content-start meeting-handler" style="margin-top:5rem;">
                    <li style="padding: 0;">
                        <button
                            class="btn btn-lg btn-outline-success text-light font-weight-bold display-center new-meeting"
                            style="background-color: #12530e;"><span><i
                                    class="inline-icon material-icons mr-2">video_call</i></span>New
                            Meeting</button>
                    </li>
                    <li class="enter-code">
                        <button class="btn btn-lg btn-outline-danger text-dark font-weight-bold display-center"
                            style="background-color: rgb(255, 255, 255);">
                            <span><i class="inline-icon material-icons mr-2">keyboard</i></span>
                            <input class="enter_code" type="text" maxlength="11" placeholder="Enter a Code" style="border: none;">
                        </button>
                    </li>
                    <li class="text-light font-weight-bold cursor_pointer join-action">
                        Join
                    </li>
                </ul>
            </div>
            <div class="container2">
                <img src="./images/index2.png" class="signin-image6" alt="">
            </div>
        </div>
        `
    },
    after_render: home_init
}

export default HomeScreen;