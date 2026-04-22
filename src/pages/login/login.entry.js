import "../../shared/styles/global.css"
import "./login.css";
import { validator } from '../../shared/utils/validations.js';
import bcrypt from "bcryptjs";

const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
email.addEventListener('input', clearWarning);
password.addEventListener('input', clearWarning);

async function logIn(email, password) {

    const registeredUser = localStorage.getItem(email);

    if (!registeredUser) {
        console.log(`User with email: ${email} is not registered!`);
        return false;
    }

    const user = JSON.parse(registeredUser);
    const validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
        console.log(`Senha válida para usuário: ${user.email}`);
        return true;

    } else {
        console.log(`Senha inválida para usuário: ${user.email}`);
        return false;
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const existingWarning = form.querySelector('.warning');
    if(existingWarning){
        existingWarning.remove();
    }

    const errorMessage = validator.validateEmail(email.value);
    if(errorMessage){
        const warning = document.createElement('p');
        warning.textContent = errorMessage;
        warning.classList.add('warning');
        form.prepend(warning);
        return;
    }

    const success = await logIn(email.value.trim(), password.value);
    if (success) {
        window.location.replace("dashboard.html");
    } else {
        const warning = document.createElement('p');
        warning.textContent = 'E-mail ou senha incorreto.'
        warning.classList.add('warning');
        form.prepend(warning);
    }
});

const container = document.querySelector('.container');
const imageWrapper = document.querySelector('.content-image-wrapper');

function handleResponsiveContent() {
    const isMobileWidth = window.matchMedia("(max-width: 768px)").matches;

    if (isMobileWidth) {
        imageWrapper.style.display = 'none';
    } else {

        if (!container.contains(imageWrapper)) {
            container.appendChild(imageWrapper);
        }
        imageWrapper.style.display = 'flex';
    }
}

const mediaQuery = window.matchMedia("(max-width: 768px)");
mediaQuery.addEventListener('change', handleResponsiveContent);

handleResponsiveContent();

function clearWarning() {
    const warning = form.querySelector('.warning');
    if(warning){
        warning.remove();
    }
}


