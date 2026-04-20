import "./signup.css";
import { validator } from '../../shared/utils/validations.js';
import { greeting } from './signup.page.js';

console.log(greeting);

/* const form = document.getElementById('sign-form');
const passwordInput = document.getElementById('password');
const checklist = document.getElementById('password-checklist');

// Validação em tempo real
passwordInput.addEventListener('input', () => {
    passwordInput.setCustomValidity('');

    const passwordValue = passwordInput.value;
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

form.addEventListener('submit', (event) => {
    event.preventDefault();

    passwordInput.setCustomValidity('');

    // Validação final antes de enviar
    const errorMessage = validator.validatePassword(passwordInput.value);
    
    if (errorMessage) {
        console.log("Validação falhou com erro:", errorMessage);
        passwordInput.setCustomValidity(errorMessage);
        passwordInput.reportValidity();
        return;
    }

    console.log('Formulário de login válido');
}); */


