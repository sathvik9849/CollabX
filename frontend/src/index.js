import { hideloading, parseRequestUrl } from "./js/utils.js";
import HomeScreen from "./screens/HomeScreen.js";
import MeetingScreen from "./screens/MeetingScreen.js";
import WhiteBoardScreen from "./screens/WhiteBoardScreen.js";
import dashboardScreen from "./screens/dashboardScreen.js";
import navBarScreen from "./screens/navBarScreen.js";
import signUpScreen from "./screens/signUpScreen.js";

const meetAndDraw = [MeetingScreen, WhiteBoardScreen];
const routes = {
  "/": HomeScreen,
  "/meeting": meetAndDraw,
  "/dashboard": dashboardScreen,
  "/signup": signUpScreen,
};

const router = async () => {
  const request = parseRequestUrl();
  const parseUrl =
    (request.resource ? `/${request.resource}` : "/") +
    (request.verb ? `${request.verb.split("?")[0]}` : "");
  const screen = routes[parseUrl];
  if (screen === HomeScreen) {
    const main = document.getElementById("main");
    const nav = document.getElementById("nav");
    nav.innerHTML = await navBarScreen.render();
    navBarScreen.after_render();
    main.innerHTML = HomeScreen.render();
    HomeScreen.after_render();
    hideloading();
  } else if (screen === meetAndDraw) {
    const index = document.getElementById("index");
    const whiteboardCont = document.getElementById("whiteboard-cont");
    index.innerHTML = meetAndDraw[0].render();
    whiteboardCont.innerHTML = meetAndDraw[1].render();
    meetAndDraw[0].after_render();
    meetAndDraw[1].after_render();
    hideloading();
  } else if (screen === dashboardScreen) {
    const nav = document.getElementById("dash_nav");
    const body = document.getElementById("row");
    if (await dashboardScreen.pre_render()) {
      nav.innerHTML = dashboardScreen.render_dashboard_nav();
      body.innerHTML = dashboardScreen.render_body();
      dashboardScreen.after_render();
    }
    hideloading();
  } else if (screen === signUpScreen) {
    const container = document.getElementById("container");
    // container.innerHTML = signUpScreen.render();
    // signUpScreen.after_render();
    // signUpScreen.render_google_login();
    // hideloading();
    console.log("Rendering signup...");
    container.innerHTML = signUpScreen.render();
    console.log("Calling after_render");
    signUpScreen.after_render();
    console.log("Loading Google Login...");
    signUpScreen.render_google_login();
    console.log("Calling hideloading()");
    hideloading();
  }
};
window.addEventListener("load", router);
