import "../../shared/styles/global.css"
import "./dashboard.css";

const currentUserEmail = sessionStorage.getItem('lokal.currentUserEmail');
if(!currentUserEmail){
    window.location.replace('login.html');
}

const rawUser = localStorage.getItem(currentUserEmail);
const currentUser = rawUser? JSON.parse(rawUser) : null;

if(currentUser === null){
    sessionStorage.setItem('lokal.errorMessage', 'Não foi possível obter os dados do usuário. Faça login ou cadastre-se novamente.')
    window.location.replace('login.html');
}

console.log(`Usuário autenticado: ${currentUser.email}`);
