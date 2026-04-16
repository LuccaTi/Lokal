import "./home.css";
import { homePage } from './home.page.js';

const main = document.querySelector('.home-main');
const home = homePage.createHomePage();

main.append(home);

