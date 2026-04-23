import "../../shared/styles/global.css"
import "./signup.css";
import { validator } from '../../shared/utils/validations.js';
import bcrypt from "bcryptjs";

const form = document.getElementById('signup-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const checklist = document.getElementById('password-checklist');
email.addEventListener('input', (event) => {
    clearWarning();
    clearConfirmation();
});
password.addEventListener('input', (event) => {
    clearWarning();
    clearConfirmation();
});

// Validação em tempo real
password.addEventListener('input', () => {
    const passwordValue = password.value;
    const status = validator.getPasswordStatus(passwordValue);
    updateChecklistUI(status);
})

const updateChecklistUI = (status) => {
    const items = checklist.querySelectorAll('li');

    items.forEach(item => {
        const ruleKey = item.dataset.rule;

        if (status[ruleKey]) {
            item.classList.remove('invalid');
            item.classList.add('valid');
        } else {
            item.classList.remove('valid');
            item.classList.add('invalid');
        }
    })
};

async function register(email, password) {

    const registration = {
        registered: false,
        error: '',
    }

    const userExists = localStorage.getItem(email);
    if (userExists) {
        registration.registered = false;
        registration.error = 'Usuário já registrado!';
        return registration;
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            email: email,
            password: hashedPassword,
            projects: [],
            tasks: []
        }

        const json = JSON.stringify(newUser);
        localStorage.setItem(email, json);

        registration.registered = true;
        registration.error = '';
    } catch (error) {
        registration.registered = false;
        registration.error = `Falha ao cadastrar usuário, erro: ${error}`;
        console.error("Falha ao cadastrar usuário, erro:", error);
        return registration;
    }

    return registration;

};

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const existingWarning = form.querySelector('.warning');
    if (existingWarning) {
        existingWarning.remove();
    }

    const emailError = validator.validateEmail(email.value);
    if (emailError) {
        const warning = document.createElement('p');
        warning.textContent = emailError;
        warning.classList.add('warning');
        form.prepend(warning);
        return;
    }

    // Validação final antes de enviar
    const passwordError = validator.validatePassword(password.value);

    if (passwordError) {
        console.log("Validação falhou com erro:", passwordError);

        const passwordField = document.getElementById('password-field');
        const warning = document.createElement('p');
        warning.textContent = 'Senha vazia ou inválida, complete as verificações!';
        warning.classList.add('warning');
        passwordField.after(warning);
        return;
    }

    console.log('Formulário de cadastro válido');

    const success = await register(email.value.trim(), password.value);
    if (success.registered) {
        console.log(`Usuário: ${email.value} cadastrado com sucesso`);

        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = 'Fazer login?';
        loginLink.setAttribute('id', 'confirmation-link');

        const confirmation = document.createElement('p');
        confirmation.append('Usuário cadastrado com sucesso, ', loginLink)
        confirmation.classList.add('confirmation');
        form.prepend(confirmation);

    } else {
        const warning = document.createElement('p');

        if (success.error.includes('registrado')) {
            warning.textContent = 'Usuário já cadastrado!';
        } else {
            warning.textContent = 'Não foi possível registrar o usuário, erro interno.';
        }

        console.log(`Não foi possível registrar o usuário, erro: ${success.error}`);
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
    if (warning) {
        warning.remove();
    }
}

function clearConfirmation() {
    const confirmation = form.querySelector('.confirmation');
    if (confirmation) {
        confirmation.remove();
    }
}




