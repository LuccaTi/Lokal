import { menuCreator } from "../menu/dashboard.menu.js";
import { positionOverlay } from "../../../shared/utils/domUtils.js";
import { positionEllipsisOverlay } from "../../../shared/utils/domUtils.js";
import * as contentCreator from "../content/dashboard.content.js";

export function initLayoutBlocks(currentUser, callbacks) {

    const mainContainer = document.querySelector('.container');
    const menuContainer = document.querySelector('.content-menu');
    const contentContainer = document.querySelector('.content-main');


    // #region Menu Lateral
    // 1. Menu Lateral / Backdrop:
    const sideButtonMenu = menuCreator.createSideButton();
    sideButtonMenu.addEventListener('click', callbacks.toggleMenu);
    mainContainer.append(sideButtonMenu);

    const menuBackDrop = document.createElement('div');
    menuBackDrop.classList.add('menu-backdrop');
    mainContainer.append(menuBackDrop);

    menuBackDrop.addEventListener('click', () => {
        callbacks.setMenuCollapsed(true);
    });

    // 2. Header
    const header = menuCreator.createHeader(currentUser);
    const headerButton = menuCreator.createHeaderButton(currentUser);
    const headerOverlay = menuCreator.createHeaderOverlay(currentUser);

    headerButton.addEventListener('click', (event) => {
        event.stopPropagation();

        let existingOverlay = document.querySelector('.header-overlay-portal');

        if (!existingOverlay) {
            callbacks.closeMenuOverlays();
            callbacks.disableMenuScroll();
            const overlay = menuCreator.createHeaderOverlay(currentUser);
            overlay.classList.add('header-overlay-portal');

            document.body.append(overlay);
            positionOverlay(headerButton, overlay);

            headerButton.classList.add('active');
        } else {
            existingOverlay.remove();
            headerButton.classList.remove('active');
        }

        callbacks.unclickArrowButton();
    });

    const addTaskButton = menuCreator.createAddTaskButton();
    header.append(headerButton, addTaskButton);

    const menuTop = menuCreator.createMenuTop();
    menuTop.append(header);


    // 3. Restante do menu
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

        callbacks.closeContentOverlays();

        let existingOverlay = document.querySelector('.plus-overlay-portal');

        if (!existingOverlay) {
            callbacks.closeMenuOverlays();
            callbacks.disableMenuScroll();
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

            plusButton.classList.add('plus-button-clicked');
            callbacks.unclickArrowButton();
        } else {
            existingOverlay.remove();
            plusButton.classList.remove('plus-button-clicked');
        }
    });

    const arrowButton = menuCreator.createArrowButton();
    arrowButton.addEventListener('mouseenter', () => toggleHover(true));
    arrowButton.addEventListener('mouseleave', () => toggleHover(false));
    arrowButton.addEventListener('click', (event) => {
        event.stopPropagation();

        if (currentUser.projects.length >= 0) {
            let isOpen = arrowOverlay.classList.contains('arrow-overlay-open');

            callbacks.closeMenuOverlays();
            callbacks.closeContentOverlays();

            if (currentUser.projects.length === 0) {
                callbacks.unclickArrowButton();
                return;
            }

            if (!isOpen) {
                arrowOverlay.innerHTML = '';

                currentUser.projects.forEach((element) => {
                    let overlay = menuCreator.createProjectButtonDiv();
                    let button = menuCreator.createProjectButton(element.projectName);
                    let ellipsisButton = menuCreator.createEllipsisButton();

                    button.addEventListener('click', () => {
                        callbacks.closeEllipsisOverlays();
                        callbacks.closeContentOverlays();
                    });

                    ellipsisButton.addEventListener('click', () => {
                        event.stopPropagation();

                        callbacks.closeContentOverlays();

                        const alreadyOpened = ellipsisButton.classList.contains('ellipsis-button-clicked');

                        callbacks.closeEllipsisOverlays();

                        if (!alreadyOpened) {
                            callbacks.disableMenuScroll();
                            const overlay = menuCreator.createEllipsisButtonOverlay();
                            overlay.classList.add('ellipsis-overlay-portal');

                            const overlayButtons = overlay.querySelectorAll('.overlay-button');

                            const editProjectButton = overlayButtons[0];
                            editProjectButton.addEventListener('click', (e) => {
                                e.stopPropagation();
                                callbacks.closeContentOverlays();
                                overlay.remove();
                                ellipsisButton.classList.remove('ellipsis-button-clicked');
                                //callbacks.unclickArrowButton();
                            });

                            const deleteProjectButton = overlayButtons[1];
                            deleteProjectButton.addEventListener('click', (e) => {
                                e.stopPropagation();
                                callbacks.closeContentOverlays();
                                overlay.remove();
                                ellipsisButton.classList.remove('ellipsis-button-clicked');
                                //callbacks.unclickArrowButton();
                            });

                            document.body.append(overlay);

                            positionEllipsisOverlay(ellipsisButton, overlay);

                            ellipsisButton.classList.add('ellipsis-button-clicked');
                        }
                    });

                    overlay.append(button, ellipsisButton);
                    arrowOverlay.append(overlay);
                });

                arrowOverlay.classList.add('arrow-overlay-open');
                arrowButton.classList.add('arrow-button-clicked');
                arrowButton.classList.remove('arrow-button-unclicked');
            } else {
                callbacks.unclickArrowButton();
            }
        }
    })
    const arrowOverlay = menuCreator.createArrowButtonOverlay();

    buttonContainer.append(myProjectsButton, plusButton, arrowButton);

    const menuScroll = menuCreator.createMenuScroll();
    menuScroll.append(todayButton, shortlyButton, concludedButton, historyButton, buttonContainer, arrowOverlay)

    // 4. Junção das duas partes do menu lateral
    menuContainer.append(menuTop, menuScroll);
    // #endregion

    // #region Conteúdo Principal
    // 5. Tela principal - Hoje, view sem tarefas
    const todayViewNoTasks = contentCreator.createTodayViewNoTasks();
    const todayViewAddTaskButton = contentCreator.createTodayViewNoTasksAddTaskButton();
    todayViewNoTasks.append(todayViewAddTaskButton);

    // 6. Tela principal - Formulário de adicionar tarefa
    const addTaskOverlay = contentCreator.createAddTaskForm();
    const dateButton = contentCreator.createDateButton();
    const divider = contentCreator.createOverlayDivider();
    const selectProjectButton = contentCreator.createSelectProjectButton();
    const cancelButton = contentCreator.createCancelButton();
    const overlayAddTaskButton = contentCreator.createOverlayAddTaskButton();
    const bottomButtonsDiv = contentCreator.createFormBottomButtonsDiv();
    bottomButtonsDiv.append(selectProjectButton, cancelButton, overlayAddTaskButton);
    addTaskOverlay.append(dateButton, divider, bottomButtonsDiv);

    // 7. Tela principal - Hoje, view com tarefas
    const todayViewWithTasks = contentCreator.createTodayViewWithTasks();

    // #endregion

    return {
        mainContainer,

        menuContainer,
        sideButtonMenu,
        menuBackDrop,
        addTaskButton,
        todayButton,
        shortlyButton,
        concludedButton,
        historyButton,
        myProjectsButton,
        headerButton,
        plusButton,
        arrowButton,
        arrowOverlay,

        contentContainer,
        todayViewNoTasks,
        todayViewAddTaskButton,
        addTaskOverlay,
        dateButton,
        selectProjectButton,
        cancelButton,
        todayViewWithTasks
    };
}