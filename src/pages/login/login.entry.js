import "../../shared/styles/global.css"
import "./login.css";
import { validator } from '../../shared/utils/validations.js';

const form = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const checklist = document.getElementById('password-checklist');

form.addEventListener('submit', (event) => {
    event.preventDefault();
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

//Ordem do que fazer agora:

/*
- Implementar lógica que pega os dados do formulário.
- Criar um objeto com os dados do formulário.
- Pegar esse objeto e consultar o local storage.
- Se tiver registro, ir para a página da dashboard.
- Se não tiver registro, informar no formulário e continuar na página de login.
*/

