import "./dashboard.entry.css";
import "../../shared/styles/global.css"
import { menuCreator } from "./menu/dashboard.menu.js";
import { contentCreator } from "./content/dashboard.content.js";
import { requireAuthenticatedUser } from "../../shared/utils/authSession.js";


function initDashboard() {


    const currentUser = requireAuthenticatedUser();

    if (!currentUser) return;

    console.log(`Usuário autenticado: ${currentUser.email}`);

    const mainContainer = document.querySelector('.container');
    const menuContainer = document.querySelector('.content-menu');
    const contentContainer = document.querySelector('.content-main');

    const sideButtonMenu = menuCreator.createSideButton();
    sideButtonMenu.addEventListener('click', toggleMenu);
    mainContainer.append(sideButtonMenu);

    const menuBackDrop = document.createElement('div');
    menuBackDrop.classList.add('menu-backdrop');
    mainContainer.append(menuBackDrop);

    menuBackDrop.addEventListener('click', () => {
        setMenuCollapsed(true);
    });


    // Menu da dashboard:
    const header = menuCreator.createHeader(currentUser);
    const headerButton = menuCreator.createHeaderButton(currentUser);
    const headerOverlay = menuCreator.createHeaderOverlay(currentUser);

    headerButton.addEventListener('click', (event) => {
        event.stopPropagation();

        let existingOverlay = document.querySelector('.header-overlay-portal');

        if (!existingOverlay) {
            closeMenuOverlays();
            const overlay = menuCreator.createHeaderOverlay(currentUser);
            overlay.classList.add('header-overlay-portal');

            document.body.append(overlay);
            positionOverlay(headerButton, overlay);

            headerButton.classList.add('active');
        } else {
            existingOverlay.remove();
            headerButton.classList.remove('active');
        }
    });

    const addTaskButton = menuCreator.createAddTaskButton();
    header.append(headerButton, addTaskButton);

    const menuTop = menuCreator.createMenuTop();
    menuTop.append(header);

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

            document.body.append(overlay);

            positionOverlay(plusButton, overlay);

            // Adicionar um listener pra impedir scroll do menu quando o botão plus está ativo.

            plusButton.classList.add('plus-button-clicked');
            unclickArrowButton();
        } else {
            existingOverlay.remove();
            plusButton.classList.remove('plus-button-clicked');
        }
    });

    const arrowButton = menuCreator.createArrowButton();
    arrowButton.addEventListener('mouseenter', () => toggleHover(true));
    arrowButton.addEventListener('mouseleave', () => toggleHover(false));
    const arrowButtonOverlay = menuCreator.createArrowButtonOverlay();

    const unclickArrowButton = () => {
        arrowButton.classList.remove('arrow-button-clicked');
        arrowButton.classList.add('arrow-button-unclicked');
    }

    arrowButton.addEventListener('click', (event) => {
        event.stopPropagation();

        if (currentUser.projects.length > 0) {
            let isOpen = arrowOverlay.classList.contains('arrow-overlay-open');

            closeMenuOverlays();

            if (!isOpen) {
                arrowOverlay.innerHTML = '';

                currentUser.projects.forEach((element) => {
                    let button = menuCreator.createProjectButton(element.projectName);
                    arrowOverlay.append(button);
                });

                arrowOverlay.classList.add('arrow-overlay-open');
                arrowButton.classList.add('arrow-button-clicked');
                arrowButton.classList.remove('arrow-button-unclicked');
            } else {
                unclickArrowButton();
            }
        }
    })

    buttonContainer.append(myProjectsButton, plusButton, arrowButton);

    const arrowOverlay = menuCreator.createArrowButtonOverlay();

    const menuScroll = menuCreator.createMenuScroll();
    menuScroll.append(todayButton, shortlyButton, concludedButton, historyButton, buttonContainer, arrowOverlay)

    menuContainer.append(menuTop, menuScroll);

    // Funções auxiliares:
    function closeMenuOverlays() {
        // O operador not garante que o overlay do arrow não seja removido, só fechado.
        const overlays = document.querySelectorAll('.overlay:not(#arrow-button-overlay)');
        overlays.forEach((overlay) => overlay.remove());

        const headerButtons = menuContainer.querySelectorAll('#header-button.active');
        headerButtons.forEach((button) => button.classList.remove('active'));

        plusButton.classList.remove('plus-button-clicked');
        arrowOverlay.classList.remove('arrow-overlay-open');
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
        sideButtonMenu.classList.toggle('menu-collapsed', collapsed);

        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        menuBackDrop.classList.toggle('is-visible', isMobile && !collapsed);

        if (collapsed) {
            closeMenuOverlays();
        }
    }

    function positionOverlay(anchorButton, overlay) {
        const rect = anchorButton.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const overlayHeight = overlay.offsetHeight;

        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const margin = 8;

        let topPosition;
        if (spaceBelow >= overlayHeight + margin) {
            topPosition = rect.bottom + margin;
        } else if (spaceAbove >= overlayHeight + margin) {
            topPosition = rect.top - overlayHeight - margin;
        } else {
            topPosition = rect.bottom + margin;
        }

        let leftPosition = rect.left;
        const overlayWidth = overlay.offsetWidth;
        const maxLeftPosition = window.innerWidth - overlayWidth - margin;

        if (leftPosition + overlayWidth > window.innerWidth) {
            leftPosition = maxLeftPosition > 0 ? maxLeftPosition : margin;
        }

        overlay.style.position = 'fixed';
        overlay.style.top = `${topPosition}px`;
        overlay.style.left = `${leftPosition}px`;
        overlay.style.zIndex = '50';
    }

    document.addEventListener('click', (event) => {
        const clickedInsideMenuControl = event.target.closest('.overlay, #header-button');

        if (clickedInsideMenuControl) {
            return;
        }
        closeMenuOverlays();
        closeContentOverlays()

        unclickArrowButton();
    });

    window.addEventListener('resize', () => {
        closeMenuOverlays();
        closeContentOverlays();
    })

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    setMenuCollapsed(isMobile);
}

initDashboard();
