import "./home.css";
import { homePage } from './home.page.js';

const main = document.querySelector('.home-main');
const home = homePage.createHomePage();

main.append(home);

const headerButton = document.getElementById('header-get-started-button');
const mainButton = document.getElementById('details-get-started-button');
const goToLogin = () => {
    window.location.assign('./login.html');
};

headerButton.addEventListener('click', goToLogin);
mainButton.addEventListener('click', goToLogin);