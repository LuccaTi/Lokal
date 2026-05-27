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
    menuScroll.append(todayButton, shortlyButton, historyButton, buttonContainer, arrowOverlay)

    // 4. Junção das duas partes do menu lateral
    menuContainer.append(menuTop, menuScroll);
    // #endregion

    // #region Conteúdo Principal
    // 5. Tela principal - Hoje, view sem tarefas
    const todayViewNoTasks = contentCreator.createViewWithoutTasks(
        'Hoje',
        'Bem vindo(a) à sua visualização Hoje',
        'Veja tudo com vencimento hoje em todos os seus projetos'
    );
    const todayViewAddTaskButton = contentCreator.createTodayViewNoTasksAddTaskButton();
    todayViewNoTasks.append(todayViewAddTaskButton);

    // 6. Tela principal - Formulário de adicionar tarefa
    const addTaskForm = contentCreator.createAddTaskForm();

    const dateButtonOverlayAddTask = contentCreator.createDateButtonOverlay((selectedDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        const icon = addTaskForm.dateButton.querySelector('img');

        if (selectedDate.getTime() === today.getTime()) {
            addTaskForm.dateButton.replaceChildren(icon, ' Hoje');
        } else {
            const optionsFormat = { day: 'numeric', month: 'short', year: 'numeric' };
            const formatedText = selectedDate.toLocaleDateString('pt-BR', optionsFormat);
            addTaskForm.dateButton.replaceChildren(icon, ` ${formatedText}`);
        }

        callbacks.updateTaskState(selectedDate);

        dateButtonOverlayAddTask.remove();
    });

    const selectProjectButtonOverlay = contentCreator.createSelectProjectButtonOverlay((selectedProject) => {

        addTaskForm.selectProjectButton.updateSelection(selectedProject);

        callbacks.updateProjectState(selectedProject);

        selectProjectButtonOverlay.remove();
    },
        currentUser.projects);

    // 7. Tela principal - Hoje, view com tarefas
    const todayTasks = currentUser.tasks.filter(task => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);
        return taskDueDate.getTime() === today.getTime() && !task.isCompleted;
    });
    const todayViewWithTasks = contentCreator.createTodayViewWithTasks(todayTasks);

    // 8. Tela principal - Em breve
    const shortlyViewNoTasks = contentCreator.createViewWithoutTasks(
        'Em breve',
        'Bem vindo(a) à sua visualização Em breve',
        'Veja o que vem por aí nos próximos dias em todos os seus projetos'
    );

    const shortlyTasks = currentUser.tasks.filter(task => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);
        return taskDueDate.getTime() > today.getTime() && !task.isCompleted;
    });
    const shortlyViewWithTasks = contentCreator.createShortlyViewWithTasks(shortlyTasks);

    // 9. Tela principal - Histórico
    const historyViewNoTasks = contentCreator.createViewWithoutTasks(
        'Histórico',
        'Bem vindo(a) à sua visualização Histórico',
        'Veja todas as tarefas e projetos concluídos'
    );

    const getGroupedHistoryTasks = () => {
        const completedTasks = currentUser.tasks.filter(task => task.isCompleted);
        const sortedTasks = completedTasks.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));

        const grouped = sortedTasks.reduce((acc, task) => {
            const dateToUse = task.completedDate ? new Date(task.completedDate) : new Date();
            let monthYear = dateToUse.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            monthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(task);
            return acc;
        }, {});

        return Object.entries(grouped).map((item) => {
            const monthLabel = item[0];
            const tasksForMonth = item[1];

            return {
                monthLabel: monthLabel,
                tasks: tasksForMonth
            }
        });
    };
    // #endregion

    const refreshTodayView = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTasks = currentUser.tasks.filter(task => {
            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0);
            return (taskDueDate.getTime() <= today.getTime()) && !task.isCompleted;
        });
        return contentCreator.createTodayViewWithTasks(todayTasks);
    }

    const refreshShortlyView = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const shortlyTasks = currentUser.tasks.filter(task => {
            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0);
            return (taskDueDate.getTime() > today.getTime()) && !task.isCompleted;
        });
        return contentCreator.createShortlyViewWithTasks(shortlyTasks);
    }

    const createEditTaskForm = (taskId) => {
        const task = currentUser.tasks.find(t => t.id === taskId);
        const form = contentCreator.createEditTaskForm(
            task.title,
            task.description,
            task.dueDate,
            null
        );

        form.dateButtonOverlayEditTask = contentCreator.createDateButtonOverlay((selectedDate) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            const icon = form.dateButton.querySelector('img');

            if (selectedDate.getTime() === today.getTime()) {
                form.dateButton.replaceChildren(icon, ' Hoje');
            } else {
                const optionsFormat = { day: 'numeric', month: 'short', year: 'numeric' };
                const formatedText = selectedDate.toLocaleDateString('pt-BR', optionsFormat);
                form.dateButton.replaceChildren(icon, ` ${formatedText}`);
            }

            callbacks.updateTaskState(selectedDate);

            form.dateButtonOverlayEditTask.remove();
        });

        form.selectProjectButtonOverlayEditTask = contentCreator.createSelectProjectButtonOverlay((selectedProject) => {

            form.selectProjectButton.updateSelection(selectedProject);

            callbacks.updateProjectState(selectedProject);

            form.selectProjectButtonOverlayEditTask.remove();
        },
            currentUser.projects);

        return form;
    }

    const createDeleteTaskOverlay = (taskTitle) => {
        return contentCreator.createDeleteTaskOverlay(taskTitle);
    }

    const createTaskLateWarning = (daysLate) => {
        return contentCreator.createTaskLateWarning(daysLate);
    }

    const refreshHistoryView = (monthIndex = 0) => {
        const groupedHistoryTasks = getGroupedHistoryTasks();

        if(groupedHistoryTasks.length === 0){
            return null;
        }

        const safeIndex = Math.max(0, Math.min(monthIndex, groupedHistoryTasks.length - 1));
        const currentMonthGroup = groupedHistoryTasks[safeIndex];

        const disableLeft = safeIndex === 0;
        const disableRight = safeIndex === (groupedHistoryTasks.length - 1);

        return contentCreator.createHistoryViewWithTasks(
            currentMonthGroup.tasks,
            currentMonthGroup.monthLabel,
            disableLeft,
            disableRight
        );
    }

    const createTaskCompletedWarning = (daysAgoCompleted) => {
        return contentCreator.createTaskCompletedWarning(daysAgoCompleted);
    }

    return {
        mainContainer,

        menuContainer,
        sideButtonMenu,
        menuBackDrop,
        addTaskButton,
        todayButton,
        shortlyButton,
        historyButton,
        myProjectsButton,
        headerButton,
        plusButton,
        arrowButton,
        arrowOverlay,

        contentContainer,
        todayViewNoTasks,
        todayViewAddTaskButton,
        refreshTodayView,
        createEditTaskForm,
        createDeleteTaskOverlay,
        createTaskLateWarning,
        addTaskForm,
        dateButtonOverlayAddTask,
        selectProjectButtonOverlay,

        shortlyViewNoTasks,
        shortlyViewWithTasks,
        refreshShortlyView,

        historyViewNoTasks,
        getGroupedHistoryTasks,
        refreshHistoryView,
        createTaskCompletedWarning
    };
}