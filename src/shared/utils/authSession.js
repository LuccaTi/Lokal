
export function getCurrentUserEmail() {
    return sessionStorage.getItem('lokal.currentUserEmail');
}

export function setCurrentUser(email) {
    sessionStorage.setItem('lokal.currentUserEmail', email.toLowerCase().trim());
}

export function logout() {
    sessionStorage.removeItem('lokal.currentUserEmail');
    window.location.replace('login.html');
}

export function isLoggedIn() {
    return this.getCurrentUserEmail() !== null;
}

export function requireAuthenticatedUser() {
    const currentUserEmail = sessionStorage.getItem('lokal.currentUserEmail');

    if (!currentUserEmail) {
        window.location.replace('login.html');
        return null;
    }

    const rawUser = localStorage.getItem(currentUserEmail);
    const currentUser = rawUser ? JSON.parse(rawUser) : null;

    if (currentUser === null) {
        sessionStorage.setItem('lokal.errorMessage', 'Não foi possível obter os dados do usuário. Faça login ou cadastre-se novamente.')
        window.location.replace('login.html');
        return;
    }

    return currentUser;
}
