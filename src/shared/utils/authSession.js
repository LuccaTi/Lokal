const authSession = {
    getCurrentUserEmail() {
        return sessionStorage.getItem('lokal.currentUserEmail'); 
    },

    setCurrentUser(email){
        sessionStorage.setItem('lokal.currentUserEmail', email.toLowerCase().trim());
    },

    logout() {
        sessionStorage.removeItem('lokal.currentUserEmail');
        window.location.replace('login.html');
    },

    isLoggedIn() {
        return this.getCurrentUserEmail() !== null;
    }

}

export { authSession };