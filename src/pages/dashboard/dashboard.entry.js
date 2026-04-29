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
    const headerButton = menuCreator.createHeaderButton(currentUser);
    const headerOverlay = menuCreator.createHeaderOverlay(currentUser);

    headerButton.addEventListener('click', (event) => {
        let existingOverlay = header.querySelector('.overlay');

        if (!existingOverlay) {
            closeMenuOverlays();
            const overlay = menuCreator.createHeaderOverlay(currentUser);
            header.append(overlay);
            headerButton.classList.add('active');
        } else {
            existingOverlay.remove();
            headerButton.classList.remove('active');
        }
    });

    const sideButtonMenu = menuCreator.createSideButton();
    sideButtonMenu.addEventListener('click', toggleMenu);
    header.append(headerButton, sideButtonMenu);

    const addTaskButton = menuCreator.createAddTaskButton();
    const todayButton = menuCreator.createTodayButton();
    const shortlyButton = menuCreator.createShortlyButton();
    const concludedButton = menuCreator.createConcludedButton();
    const historyButton = menuCreator.createHistoryButton();

    const buttonContainer = menuCreator.createProjectsButtonsWrapper();

    const toggleHover = (force) => myProjectsButton.classList.toggle('project-button-hovered', force);

    const myProjectsButton = menuCreator.createMyProjectsButton();
    myProjectsButton.addEventListener('mouseenter', () => toggleHover(true));
    myProjectsButton.addEventListener('mouseleave', () => toggleHover(false));

    const plusButton = menuCreator.createPlusButton();
    plusButton.addEventListener('mouseenter', () => toggleHover(true));
    plusButton.addEventListener('mouseleave', () => toggleHover(false));
    const plusButtonOverlay = menuCreator.createPlusButtonOverlay();

    plusButton.addEventListener('click', (event) => {
        event.stopPropagation();

        let existingOverlay = document.querySelector('.plus-overlay-portal');

        if (!existingOverlay) {
            closeMenuOverlays();
            const overlay = menuCreator.createPlusButtonOverlay();
            overlay.classList.add('plus-overlay-portal');

            const addProjectButton = overlay.querySelector('.overlay-button');
            addProjectButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                overlay.remove();    
                plusButton.classList.remove('plus-button-clicked');
                
                console.log("Abrir modal de criação de projeto no conteúdo principal!");
            });

            const rect = plusButton.getBoundingClientRect();

            overlay.style.position = 'fixed';
            overlay.style.top = `${rect.bottom + 8}px`;
            overlay.style.left = `${rect.left}px`;
            overlay.style.zIndex = '50';

            document.body.append(overlay);

            plusButton.classList.add('plus-button-clicked');
        } else {
            existingOverlay.remove();
            plusButton.classList.remove('plus-button-clicked');
        }
    });

    const arrowButton = menuCreator.createArrowButton();
    arrowButton.addEventListener('mouseenter', () => toggleHover(true));
    arrowButton.addEventListener('mouseleave', () => toggleHover(false));


    buttonContainer.append(myProjectsButton, plusButton, arrowButton);

    menuContainer.append(header, addTaskButton, todayButton, shortlyButton, concludedButton, historyButton, buttonContainer);

    // Conteúdo principal
    const sideButtonMain = contentCreator.createSideButton();
    sideButtonMain.addEventListener('click', toggleMenu);
    contentContainer.append(sideButtonMain);

    function closeMenuOverlays() {
        const overlays = document.querySelectorAll('.overlay');
        overlays.forEach((overlay) => overlay.remove());

        const headerButtons = menuContainer.querySelectorAll('#header-button.active');
        headerButtons.forEach((button) => button.classList.remove('active'));

        plusButton.classList.remove('plus-button-clicked');
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
        const clickedInsideMenuControl = event.target.closest('.overlay, #header-button');

        if (clickedInsideMenuControl) {
            return;
        }
        closeMenuOverlays();
        closeContentOverlays()
    });

    window.addEventListener('resize', () => {
        closeMenuOverlays();
        closeContentOverlays();
    })

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    setMenuCollapsed(isMobile);
}

initDashboard();
