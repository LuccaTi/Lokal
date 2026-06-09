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

    const arrowButton = menuCreator.createArrowButton();
    arrowButton.addEventListener('mouseenter', () => toggleHover(true));
    arrowButton.addEventListener('mouseleave', () => toggleHover(false));

    const arrowOverlay = menuCreator.createArrowButtonOverlay();

    buttonContainer.append(myProjectsButton, plusButton, arrowButton);

    const menuScroll = menuCreator.createMenuScroll();
    menuScroll.append(todayButton, shortlyButton, historyButton, buttonContainer, arrowOverlay)

    const createProjectButtonDiv = () => {
        return menuCreator.createProjectButtonDiv();
    }

    const createProjectButton = (projectTitle) => {
        return menuCreator.createProjectButton(projectTitle);
    }

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

    const refreshSelectProjectButtonOverlay = () => {
        const incompleteProjects = currentUser.projects.filter(project => project.isCompleted === false);
        const selectProjectButtonOverlay = contentCreator.createSelectProjectButtonOverlay((selectedProject) => {

            addTaskForm.selectProjectButton.updateSelection(selectedProject);

            callbacks.updateProjectState(selectedProject);

            selectProjectButtonOverlay.remove();
        },
            incompleteProjects);

        return selectProjectButtonOverlay;
    };
    const selectProjectButtonOverlay = refreshSelectProjectButtonOverlay();

    // 7. Tela principal - Hoje, view com tarefas
    const todayTasksWithoutProjects = currentUser.tasks.filter(isTaskForToday);

    const todayTasksFromProjects = currentUser.projects
        .flatMap(project =>
            project.tasks.map(task => ({
                ...task,
                projectTitle: project.title
            }))
        )
        .filter(isTaskForToday);

    const todayViewWithTasks = contentCreator.createTodayViewWithTasks(
        todayTasksWithoutProjects,
        todayTasksFromProjects
    );

    // 8. Tela principal - Em breve, view sem tarefas
    const shortlyViewNoTasks = contentCreator.createViewWithoutTasks(
        'Em breve',
        'Bem vindo(a) à sua visualização Em breve',
        'Veja o que vem por aí nos próximos dias em todos os seus projetos'
    );

    // 9. Tela principal - Em breve, view com tarefas
    const shortlyTasksWithoutProjects = currentUser.tasks.filter(isTaskForFuture);

    const shortlyTasksFromProjects = currentUser.projects
        .flatMap(project =>
            project.tasks.map(task => ({
                ...task,
                projectTitle: project.title
            }))
        )
        .filter(isTaskForFuture);

    const shortlyViewWithTasks = contentCreator.createShortlyViewWithTasks(
        shortlyTasksWithoutProjects,
        shortlyTasksFromProjects
    );

    // 10. Tela principal - Histórico
    const historyViewNoTasks = contentCreator.createViewWithoutTasks(
        'Histórico',
        'Bem vindo(a) à sua visualização Histórico',
        'Veja todas as tarefas e projetos concluídos'
    );

    const getGroupedHistoryTasks = () => {
        const completedTasks = currentUser.tasks.filter(task => task.isCompleted);
        const sortedTasks = completedTasks.sort((a, b) => new Date(a.completedDate) - new Date(b.completedDate));

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

    const getGroupedHistoryItems = () => {
        const completedTasks = currentUser.tasks
            .filter(task => task.isCompleted && task.completedDate)
            .map(task => ({
                type: 'task',
                completedDate: new Date(task.completedDate),
                task: task
            }));

        const completedProjects = currentUser.projects
            .filter(project => project.isCompleted && project.completedDate)
            .map(project => ({
                type: 'project',
                completedDate: new Date(project.completedDate),
                project: project
            }));

        const merged = [...completedTasks, ...completedProjects]
            .sort((a, b) => a.completedDate - b.completedDate);

        const grouped = merged.reduce((acc, item) => {
            let monthYear = item.completedDate.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
            });

            monthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }

            acc[monthYear].push(item);
            return acc;
        }, {});

        return Object.entries(grouped).map(([monthLabel, items]) => ({
            monthLabel,
            items
        }));
    };

    // 11. Tela principal - Meus Projetos
    const myProjectsViewWithoutProjects = contentCreator.createProjectViewWithoutProjects();


    // 12. Tela principal - Formulário para adicionar projeto
    const addProjectForm = contentCreator.createAddProjectForm();


    // 13. Tela principal - Meus Projetos, view com projetos
    const myProjectsViewWithProjects = contentCreator.createProjectViewWithAllProjects(refreshIncompleteProjects());
    // #endregion

    // #region Funções auxiliares
    const refreshTodayView = () => {
        const todayTasksWithoutProjects = currentUser.tasks.filter(isTaskForToday);

        const todayTasksFromProjects = currentUser.projects
            .flatMap(project =>
                project.tasks.map(task => ({
                    ...task,
                    projectTitle: project.title
                }))
            )
            .filter(isTaskForToday);

        return contentCreator.createTodayViewWithTasks(
            todayTasksWithoutProjects,
            todayTasksFromProjects
        );
    }

    function isTaskForToday(task) {
        const today = new Date().setHours(0, 0, 0, 0);
        const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
        return taskDueDate === today && !task.isCompleted;
    }

    function isTaskForFuture(task) {
        const today = new Date().setHours(0, 0, 0, 0);
        const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
        return taskDueDate > today && !task.isCompleted;
    }

    const refreshShortlyView = () => {
        const shortlyTasksWithoutProjects = currentUser.tasks.filter(isTaskForFuture);

        const shortlyTasksFromProjects = currentUser.projects
            .flatMap(project =>
                project.tasks.map(task => ({
                    ...task,
                    projectTitle: project.title
                }))
            )
            .filter(isTaskForFuture);

        return contentCreator.createShortlyViewWithTasks(
            shortlyTasksWithoutProjects,
            shortlyTasksFromProjects
        );
    }

    const createEditTaskFormTasks = (taskId) => {
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
            refreshIncompleteProjects());

        return form;
    }

    const createEditTaskFormProjects = (taskId, projectId) => {
        const project = currentUser.projects.find(p => p.id === projectId);
        if (!project) return null;

        callbacks.updateProjectState(project);

        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return null;

        const form = contentCreator.createEditTaskForm(
            task.title,
            task.description,
            task.dueDate,
            project
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
            refreshIncompleteProjects());

        return form;
    }

    const createDeleteTaskOverlay = (taskTitle) => {
        return contentCreator.createDeleteTaskOverlay(taskTitle);
    }

    const createTaskLateWarning = (daysLate) => {
        return contentCreator.createTaskLateWarning(daysLate);
    }

    const refreshHistoryView = (monthIndex = 0) => {
        const groupedHistoryItems = getGroupedHistoryItems();

        if (groupedHistoryItems.length === 0) {
            return null;
        }

        const safeIndex = Math.max(0, Math.min(monthIndex, groupedHistoryItems.length - 1));
        const currentMonthGroup = groupedHistoryItems[safeIndex];

        const disableLeft = safeIndex === 0;
        const disableRight = safeIndex === (groupedHistoryItems.length - 1);

        return contentCreator.createHistoryViewWithItems(
            currentMonthGroup.items,
            currentMonthGroup.monthLabel,
            disableLeft,
            disableRight
        );
    }

    const createTaskCompletedWarning = (daysAgoCompleted) => {
        return contentCreator.createTaskCompletedWarning(daysAgoCompleted);
    }

    const refreshAllProjectsView = () => {
        const incompleteProjects = currentUser.projects.filter(project => {
            return project.isCompleted === false;
        });
        return contentCreator.createProjectViewWithAllProjects(incompleteProjects);
    };

    const createDeleteProjectOverlay = (projectTitle) => {
        return contentCreator.createDeleteProjectOverlay(projectTitle);
    }

    const refreshProjectView = (projectId) => {
        const project = currentUser.projects.find((p) => p.id === projectId);

        if (!project) {
            return null;
        }

        return contentCreator.createSoloProjectView(project);
    };

    const createEditProjectForm = (projectId) => {
        const project = currentUser.projects.find(p => p.id === projectId);
        const form = contentCreator.createEditProjectForm(
            project.title
        );

        return form;
    }

    const createProjectCompletedWarning = (daysAgoCompleted) => {
        return contentCreator.createProjectCompletedWarning(daysAgoCompleted);
    }

    const createDeleteProjectPendingOverlay = (projectTitle, pendingTasksCount) => {
        return contentCreator.createDeleteProjectPendingOverlay(projectTitle, pendingTasksCount);
    };

    const createPendingTasksWarningOverlay = (projectTitle, pendingTasksCount) => {
        return contentCreator.createPendingTasksWarningOverlay(projectTitle, pendingTasksCount);
    };

    function refreshIncompleteProjects() {
        const projects = currentUser.projects.filter(project => project.isCompleted === false);
        return projects;
    };

    // #endregion

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
        plusButtonOverlay,

        createProjectButtonDiv,
        createProjectButton,
        arrowButton,
        arrowOverlay,

        contentContainer,
        todayViewNoTasks,
        todayViewAddTaskButton,
        refreshTodayView,

        createEditTaskFormTasks,
        createDeleteTaskOverlay,
        createTaskLateWarning,

        addTaskForm,
        dateButtonOverlayAddTask,
        selectProjectButtonOverlay,
        refreshSelectProjectButtonOverlay,

        shortlyViewNoTasks,
        shortlyViewWithTasks,
        refreshShortlyView,

        historyViewNoTasks,
        getGroupedHistoryItems,
        refreshHistoryView,
        createTaskCompletedWarning,

        myProjectsViewWithoutProjects,
        addProjectForm,
        myProjectsViewWithProjects,
        refreshAllProjectsView,
        createDeleteProjectOverlay,
        createEditProjectForm,
        createProjectCompletedWarning,
        refreshProjectView,
        createDeleteProjectPendingOverlay,
        createEditTaskFormProjects,
        createPendingTasksWarningOverlay
    };
}