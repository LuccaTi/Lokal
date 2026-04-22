import "../../shared/styles/global.css"
import "./signup.css";
import { validator } from '../../shared/utils/validations.js';

const form = document.getElementById('signup-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const checklist = document.getElementById('password-checklist');
email.addEventListener('input', clearWarning);
password.addEventListener('input', clearWarning);

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
   //Função que vai usar o local storage pra registrar o usuário.
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
    if (success) {
        // Colocar mensagem verde no formulário de que usuário foi registrado com sucesso mais um link para página de login.
    } else {
        // Tentar retornar múltiplos valores pra saber qual erro deu e logar ele no console.
        const warning = document.createElement('p');
        warning.textContent = 'Não foi possível registrar o usuário!'
        console.log(`Não foi possível registrar o usuário! Erro: `);
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



