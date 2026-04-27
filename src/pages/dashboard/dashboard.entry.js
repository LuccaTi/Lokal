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

    const menuBackDrop = document.createElement('div');
    menuBackDrop.classList.add('menu-backdrop');
    mainContainer.append(menuBackDrop);

    menuBackDrop.addEventListener('click', () => {
        setMenuCollapsed(true);
    });

    // Menu da dashboard
    const header = menuCreator.createHeader(currentUser);

    const sideButtonMenu = menuCreator.createSideButton();
    sideButtonMenu.addEventListener('click', toggleMenu);
    header.append(sideButtonMenu);


    const addTaskButton = menuCreator.createAddTaskButton();
    menuContainer.append(header, addTaskButton);

    // Conteúdo principal
    const sideButtonMain = contentCreator.createSideButton();
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

        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        menuBackDrop.classList.toggle('is-visible', isMobile && !collapsed);

        if (collapsed) {
            closeMenuOverlays();
        }
    }

    document.addEventListener('click', (event) => {
        const clickedInsideMenuControl = event.target.closest('.overlay, #header-button, .menu-button');

        if (clickedInsideMenuControl) {
            return;
        }
        closeMenuOverlays();
        closeContentOverlays()
    });

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    setMenuCollapsed(isMobile);
}

initDashboard();
