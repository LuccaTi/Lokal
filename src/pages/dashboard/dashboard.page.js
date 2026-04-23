import { authSession } from "../../shared/utils/authSession";


// Botão de logout, para ser usado depois:
const logoutButton = document.createElement('button');
logoutButton.addEventListener('click', () => {
    authSession.logout;
});