import "./dashboard.entry.css";
import "../../shared/styles/global.css"
import { menuCreator } from "./menu/dashboard.menu.js";
import { contentCreator } from "./content/dashboard.content.js";

function initDashboard() {
    const currentUserEmail = sessionStorage.getItem('lokal.currentUserEmail');
    if (!currentUserEmail) {
        window.location.replace('login.html');
        return;
    }

    const rawUser = localStorage.getItem(currentUserEmail);
    const currentUser = rawUser ? JSON.parse(rawUser) : null;

    if (currentUser === null) {
        sessionStorage.setItem('lokal.errorMessage', 'Não foi possível obter os dados do usuário. Faça login ou cadastre-se novamente.')
        window.location.replace('login.html');
        return;
    }

    console.log(`Usuário autenticado: ${currentUser.email}`);

    const mainContainer = document.querySelector('.container');
    const menuContainer = document.querySelector('.content-menu');
    const contentContainer = document.querySelector('.content-main');


    // Menu da dashboard
    const header = menuCreator.createHeader(currentUser);

    const sideButtonMenu = menuCreator.createSideButton();
    sideButtonMenu.addEventListener('click', toggleMenu);

    header.append(sideButtonMenu);
    menuContainer.append(header);


    // Conteúdo principal
    const sideButtonMain = contentCreator.createSideButton();
    sideButtonMain.classList.add('is-hidden');
    sideButtonMain.addEventListener('click', toggleMenu);
    contentContainer.append(sideButtonMain);

    function closeMenuOverlays() {
        const overlays = menuContainer.querySelectorAll('.overlay');
        overlays.forEach((overlay) => overlay.remove());

        const activeButtons = menuContainer.querySelectorAll('#header-button.active');
        activeButtons.forEach((button) => button.classList.remove('active'));
    }

    function closeContentOverlays() {
        const overlays = contentContainer.querySelectorAll('.overlay');
        overlays.forEach((overlay) => overlay.remove());
    }

    function toggleMenu() {
        const isCollapsed = mainContainer.classList.contains('menu-collapsed');
        // O operador NOT faz o botão alternar o estado, se está fechado agora então é para abrir e vice-versa.
        setMenuCollapsed(!isCollapsed);
    }

    function setMenuCollapsed(collapsed) {
        mainContainer.classList.toggle('menu-collapsed', collapsed);
        sideButtonMain.classList.toggle('is-hidden', !collapsed);
        if (collapsed) {
            closeMenuOverlays();
        }
    }

    document.addEventListener('click', (event) => {
        const clickedInsideMenuControl = event.target.closest('.overlay, #header-button');

        if (clickedInsideMenuControl) {
            return;
        }
        closeMenuOverlays();
        closeContentOverlays()
    });
}

initDashboard();
