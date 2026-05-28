import "./dashboard.entry.css";
import "../../shared/styles/global.css"
import { requireAuthenticatedUser } from "../../shared/utils/authSession.js";
import { initLayoutBlocks } from "./controllers/dashboard.layout.js";
import { createTask } from "../../core/domain/task.js";
import { userStorage } from "../../core/storage/userStorage.js";
import { createUser } from "../../core/domain/user.js";
import { formatDateForButton } from "../../shared/utils/dateUtils.js";
import { positionOverlay } from "../../shared/utils/domUtils.js";
import { createProject } from "../../core/domain/project.js";

function initDashboard() {

    const currentUser = requireAuthenticatedUser();

    if (!currentUser) return;

    console.log(`Usuário autenticado: ${currentUser.email}`);

    const currentTaskState = {
        dueDate: new Date(),
    };

    const currentProjectState = {
        project: null,
    };

    let historyMonthIndex = 0;

    // #region Criação dos callbacks e 'env'.
    const controllerCallbacks = {
        toggleMenu: () => {
            const isCollapsed = env.mainContainer.classList.contains('menu-collapsed');
            // O operador NOT faz o botão alternar o estado, se está fechado agora então é para abrir e vice-versa.
            controllerCallbacks.setMenuCollapsed(!isCollapsed);
        },

        setMenuCollapsed: (collapsed) => {
            env.mainContainer.classList.toggle('menu-collapsed', collapsed);
            env.sideButtonMenu.classList.toggle('menu-collapsed', collapsed);

            const isMobile = window.matchMedia('(max-width: 767px)').matches;
            env.menuBackDrop.classList.toggle('is-visible', isMobile && !collapsed);

            if (collapsed) {
                controllerCallbacks.closeMenuOverlays();
            }
        },

        disableMenuScroll: () => {
            window.addEventListener('wheel', preventScrollHandler, { passive: false });
            window.addEventListener('touchmove', preventScrollHandler, { passive: false });
        },

        enableMenuScroll: () => {
            window.removeEventListener('wheel', preventScrollHandler);
            window.removeEventListener('touchmove', preventScrollHandler);
        },

        closeMenuOverlays: () => {
            // O operador not garante que o overlay do arrow não seja removido, só fechado.
            const overlays = document.querySelectorAll('.overlay:not(#arrow-button-overlay)');
            overlays.forEach((overlay) => overlay.remove());

            const headerButtons = env.menuContainer.querySelectorAll('#header-button.active');
            headerButtons.forEach((button) => button.classList.remove('active'));

            env.plusButton.classList.remove('plus-button-clicked');
            env.arrowOverlay.classList.remove('arrow-overlay-open');

            controllerCallbacks.enableMenuScroll();
        },

        unclickArrowButton: () => {
            if (env && env.arrowButton) {
                env.arrowButton.classList.remove('arrow-button-clicked');
                env.arrowButton.classList.add('arrow-button-unclicked');
                let existingOverlay = env.arrowButton.querySelector('.overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
            }
        },

        closeContentOverlays() {
            const overlays = document.querySelectorAll('.overlay-content');
            overlays.forEach((overlay) => {

                if (!overlay.classList.contains('select-project-overlay')) {
                    overlay.classList.remove('active');
                    setTimeout(() => {
                        overlay.remove();
                        if (overlay === env.addTaskForm.element) {
                            env.addTaskForm.resetForm();
                            currentTaskState.dueDate = new Date();
                            currentProjectState.project = null;
                        }
                        if (overlay === env.addProjectForm.element) {
                            env.addProjectForm.resetForm();
                            currentTaskState.dueDate = new Date();
                            currentProjectState.project = null;
                        }
                    }, 300);
                } else {
                    overlay.remove();
                }
            });

            this.closeCalendarOverlay();
        },

        closeCalendarOverlay() {
            const calendarOverlay = document.querySelector('.calendar-overlay');
            if (calendarOverlay) {
                calendarOverlay.remove();
            }
        },

        closeSelectProjectOverlay() {
            const selectProjectOverlay = document.querySelector('.select-project-overlay');
            if (selectProjectOverlay) {
                selectProjectOverlay.remove();
            }
        },

        updateTaskState(date) {
            currentTaskState.dueDate = date;
        },

        updateProjectState(project) {
            currentProjectState.project = project;
        }
    }

    // Criador do menu lateral e da tela principal
    const env = initLayoutBlocks(currentUser, controllerCallbacks);

    // #endregion

    // #region Ponte do menu com tela principal

    // Form de adicionar tarefa
    env.addTaskButton.addEventListener('click', (event) => {
        event.stopPropagation();

        controllerCallbacks.closeMenuOverlays();
        controllerCallbacks.closeContentOverlays();
        controllerCallbacks.unclickArrowButton();

        controllerCallbacks.updateTaskState(new Date());
        controllerCallbacks.updateProjectState(null);

        document.body.append(env.addTaskForm.element);

        // Um atraso minúsculo para forçar o navegador a renderizar o estado original, caso contrário ele já renderiza a versão final.
        setTimeout(() => {
            env.addTaskForm.addTaskButton.classList.add('add-button-restrict');
            env.addTaskForm.element.classList.add('active');
        }, 10);
    });

    env.addTaskForm.titleInput.addEventListener('input', () => {
        const hasTitle = env.addTaskForm.titleInput.value.trim() !== '';
        env.addTaskForm.addTaskButton.classList.toggle('add-button-restrict', !hasTitle);
    });

    env.addTaskForm.dateButton.addEventListener('click', (event) => {
        event.stopPropagation();
        controllerCallbacks.closeSelectProjectOverlay();

        const existingOverlay = document.querySelector('.calendar-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
            return;
        }

        env.dateButtonOverlayAddTask.resetCalendar();
        document.body.append(env.dateButtonOverlayAddTask);
    });

    env.addTaskForm.selectProjectButton.addEventListener('click', (event) => {
        event.stopPropagation();
        controllerCallbacks.closeCalendarOverlay();

        const existingOverlay = document.querySelector('.select-project-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
            return;
        }

        document.body.append(env.selectProjectButtonOverlay);
    });

    env.addTaskForm.cancelButton.addEventListener('click', (event) => {
        event.stopPropagation();
        controllerCallbacks.closeContentOverlays();
    });

    env.addTaskForm.element.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleText = env.addTaskForm.titleInput.value.trim();
        const descriptionText = env.addTaskForm.descriptionInput.value.trim();

        const newTask = createTask({
            title: titleText,
            description: descriptionText,
            dueDate: currentTaskState.dueDate,
        })

        currentUser.addTask(newTask);

        userStorage.saveUser(currentUser);

        controllerCallbacks.closeContentOverlays();

        const taskDate = new Date(newTask.dueDate).setHours(0, 0, 0, 0);
        const today = new Date().setHours(0, 0, 0, 0);
        if (taskDate === today) {
            env.todayButton.click();
        } else {
            env.shortlyButton.click();
        }

        closeMenuIfMobile()
    });

    env.todayButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        closeMenuIfMobile()
        env.contentContainer.replaceChildren();

        const hasTasksForToday = currentUser.tasks.some(task => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0);

            return taskDueDate.getTime() === today.getTime() && !task.isCompleted;
        });

        const hasOverdueTasks = currentUser.tasks.some(task => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const taskDueDate = new Date(task.dueDate);
            taskDueDate.setHours(0, 0, 0, 0);

            return taskDueDate < today && !task.isCompleted;
        });

        if (!hasTasksForToday && !hasOverdueTasks) {
            env.contentContainer.append(env.todayViewNoTasks);

            env.todayViewAddTaskButton.addEventListener('click', (event) => {
                event.stopPropagation();

                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.unclickArrowButton();

                controllerCallbacks.updateTaskState(new Date());
                controllerCallbacks.updateProjectState(null);

                document.body.append(env.addTaskForm.element);

                setTimeout(() => {
                    env.addTaskForm.addTaskButton.classList.add('add-button-restrict');
                    env.addTaskForm.element.classList.add('active');
                }, 10);
            });
        } else {
            const freshViewToday = env.refreshTodayView();

            env.contentContainer.append(freshViewToday.element);

            freshViewToday.taskViewsWithoutProject.forEach(taskView => {

                let task = currentUser.tasks.find(task => task.id === taskView.taskId);

                if (isTaskOverdue(task)) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const dueDate = new Date(task.dueDate);
                    dueDate.setHours(0, 0, 0, 0);

                    const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    const warningOverlay = env.createTaskLateWarning(daysLate);
                    taskView.element.append(warningOverlay);
                }

                taskView.checkbox.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        task.toggleStatus(new Date());
                    } else {
                        task.toggleStatus(null);
                    }

                    userStorage.saveUser(currentUser);

                    env.todayButton.click();
                });

                taskView.editButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    if (!task) return;

                    controllerCallbacks.updateTaskState(task.dueDate);
                    controllerCallbacks.updateProjectState(task.project || null);

                    const date = formatDateForButton(task.dueDate);

                    const currentTaskId = currentUser.tasks.find(t => t.id === taskView.taskId).id;
                    const editOverlay = env.createEditTaskForm(currentTaskId);

                    document.body.append(editOverlay.element);

                    setTimeout(() => {
                        editOverlay.element.classList.add('active');
                    }, 10);

                    editOverlay.dateButton.addEventListener('click', (e) => {
                        event.stopPropagation();
                        controllerCallbacks.closeSelectProjectOverlay();

                        const existingOverlay = document.querySelector('.calendar-overlay');
                        if (existingOverlay) {
                            existingOverlay.remove();
                            return;
                        }

                        editOverlay.dateButtonOverlayEditTask.resetCalendar();
                        document.body.append(editOverlay.dateButtonOverlayEditTask);
                    });

                    editOverlay.selectProjectButton.addEventListener('click', (e) => {
                        event.stopPropagation();
                        controllerCallbacks.closeCalendarOverlay();

                        const existingOverlay = document.querySelector('.select-project-overlay');
                        if (existingOverlay) {
                            existingOverlay.remove();
                            return;
                        }

                        document.body.append(editOverlay.selectProjectButtonOverlayEditTask);
                    });

                    editOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    editOverlay.element.addEventListener('submit', (e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        let updatedTitle = editOverlay.titleInput.value.trim();
                        let updatedDescription = editOverlay.descriptionInput.value.trim();

                        if (updatedTitle === '') {
                            updatedTitle = task.title;
                        }

                        if (updatedDescription === '') {
                            updatedDescription = task.description;
                        }

                        task.updateTitle(updatedTitle);
                        task.updateDescription(updatedDescription);
                        task.updateDueDate(currentTaskState.dueDate);

                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();

                        const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                        const todayDate = new Date().setHours(0, 0, 0, 0);

                        if (taskDate <= todayDate) {
                            env.todayButton.click();
                        } else {
                            env.shortlyButton.click();
                        }
                    });
                });

                taskView.deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    const deleteOverlay = env.createDeleteTaskOverlay(taskView.taskTitle.textContent);
                    document.body.append(deleteOverlay.element);

                    setTimeout(() => {
                        deleteOverlay.element.classList.add('active');
                    }, 10);

                    deleteOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    deleteOverlay.confirmButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentUser.removeTask(taskView.taskId);
                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();
                        env.todayButton.click();
                    });
                });
            });

            freshViewToday.addTaskButton.addEventListener('click', (event) => {
                event.stopPropagation();

                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.closeContentOverlays();
                controllerCallbacks.unclickArrowButton();

                controllerCallbacks.updateTaskState(new Date());
                controllerCallbacks.updateProjectState(null);

                document.body.append(env.addTaskForm.element);

                // Um atraso minúsculo para forçar o navegador a renderizar o estado original, caso contrário ele já renderiza a versão final.
                setTimeout(() => {
                    env.addTaskForm.addTaskButton.classList.add('add-button-restrict');
                    env.addTaskForm.element.classList.add('active');
                }, 10);
            });
        }

        env.todayButton.classList.add('button-clicked');
    });

    env.shortlyButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        closeMenuIfMobile()

        env.contentContainer.replaceChildren();
        env.shortlyButton.classList.add('button-clicked');

        const today = new Date().setHours(0, 0, 0, 0);

        const hasFutureTasks = currentUser.tasks.some(task => {
            return new Date(task.dueDate).setHours(0, 0, 0, 0) > today;
        });

        if (!hasFutureTasks) {
            env.contentContainer.append(env.shortlyViewNoTasks);
        } else {
            const freshViewShortly = env.refreshShortlyView();

            env.contentContainer.append(freshViewShortly.element);

            freshViewShortly.taskViewsWithoutProject.forEach(taskView => {
                let task = currentUser.tasks.find(task => task.id === taskView.taskId);

                taskView.editButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    if (!task) return;

                    controllerCallbacks.updateTaskState(task.dueDate);
                    controllerCallbacks.updateProjectState(task.project || null);

                    const date = formatDateForButton(task.dueDate);

                    const currentTaskId = currentUser.tasks.find(t => t.id === taskView.taskId).id;
                    const editOverlay = env.createEditTaskForm(currentTaskId);

                    document.body.append(editOverlay.element);

                    setTimeout(() => {
                        editOverlay.element.classList.add('active');
                    }, 10);

                    editOverlay.dateButton.addEventListener('click', (e) => {
                        event.stopPropagation();
                        controllerCallbacks.closeSelectProjectOverlay();

                        const existingOverlay = document.querySelector('.calendar-overlay');
                        if (existingOverlay) {
                            existingOverlay.remove();
                            return;
                        }

                        editOverlay.dateButtonOverlayEditTask.resetCalendar();
                        document.body.append(editOverlay.dateButtonOverlayEditTask);
                    });

                    editOverlay.selectProjectButton.addEventListener('click', (e) => {
                        event.stopPropagation();
                        controllerCallbacks.closeCalendarOverlay();

                        const existingOverlay = document.querySelector('.select-project-overlay');
                        if (existingOverlay) {
                            existingOverlay.remove();
                            return;
                        }

                        document.body.append(editOverlay.selectProjectButtonOverlayEditTask);
                    });

                    editOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    editOverlay.element.addEventListener('submit', (e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        let updatedTitle = editOverlay.titleInput.value.trim();
                        let updatedDescription = editOverlay.descriptionInput.value.trim();

                        if (updatedTitle === '') {
                            updatedTitle = task.title;
                        }

                        if (updatedDescription === '') {
                            updatedDescription = task.description;
                        }

                        task.updateTitle(updatedTitle);
                        task.updateDescription(updatedDescription);
                        task.updateDueDate(currentTaskState.dueDate);

                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();

                        const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                        const todayDate = new Date().setHours(0, 0, 0, 0);

                        if (taskDate <= todayDate) {
                            env.todayButton.click();
                        } else {
                            env.shortlyButton.click();
                        }
                    });
                });

                taskView.deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    const deleteOverlay = env.createDeleteTaskOverlay(taskView.taskTitle.textContent);
                    document.body.append(deleteOverlay.element);

                    setTimeout(() => {
                        deleteOverlay.element.classList.add('active');
                    }, 10);

                    deleteOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    deleteOverlay.confirmButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentUser.removeTask(taskView.taskId);
                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();
                        env.shortlyButton.click();
                    });
                });
            });
        }
    });

    env.historyButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        closeMenuIfMobile();

        historyMonthIndex = 0;

        function renderCurrentHistoryMonth() {
            env.contentContainer.replaceChildren();

            const groupedTasks = env.getGroupedHistoryTasks();

            if (groupedTasks.length === 0) {
                env.contentContainer.append(env.historyViewNoTasks);
                return;
            }

            const historyView = env.refreshHistoryView(historyMonthIndex);
            if (historyView === null) {
                console.log('Erro ao renderizar histórico, favor verificar função refreshHistoryView');
                env.contentContainer.append(env.historyViewNoTasks);
                return;
            }

            historyView.leftArrowButton.addEventListener('click', () => {
                if (historyMonthIndex > 0) {
                    historyMonthIndex--;
                    renderCurrentHistoryMonth();
                }
            });

            historyView.rightArrowButton.addEventListener('click', () => {
                if (historyMonthIndex < groupedTasks.length - 1) {
                    historyMonthIndex++;
                    renderCurrentHistoryMonth();
                }
            });

            historyView.completedTasksViews.forEach(taskView => {
                let task = currentUser.tasks.find(task => task.id === taskView.taskId);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const completedDate = new Date(task.completedDate);
                completedDate.setHours(0, 0, 0, 0);

                const daysAgoCompleted = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
                const warningOverlay = env.createTaskCompletedWarning(daysAgoCompleted);
                taskView.element.append(warningOverlay);

                taskView.deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    const deleteOverlay = env.createDeleteTaskOverlay(taskView.taskTitle.textContent);
                    document.body.append(deleteOverlay.element);

                    setTimeout(() => {
                        deleteOverlay.element.classList.add('active');
                    }, 10);

                    deleteOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    deleteOverlay.confirmButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentUser.removeTask(taskView.taskId);
                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();

                        const updatedGroupedTasks = env.getGroupedHistoryTasks();
                        if (updatedGroupedTasks.length === 0) {
                            historyMonthIndex = 0; // Segurança
                            renderCurrentHistoryMonth();
                            return;
                        }

                        if (historyMonthIndex >= updatedGroupedTasks.length) {
                            historyMonthIndex = updatedGroupedTasks.length - 1; // Segurança
                        }

                        renderCurrentHistoryMonth();
                    });
                });
            });

            env.contentContainer.append(historyView.element);
        }

        renderCurrentHistoryMonth();

        env.historyButton.classList.add('button-clicked');
    });

    const addProjectButton = env.plusButtonOverlay.querySelector('.overlay-button');
    addProjectButton.addEventListener('click', (e) => {
        e.stopPropagation();
        env.plusButtonOverlay.remove();
        env.plusButton.classList.remove('plus-button-clicked');

        controllerCallbacks.closeMenuOverlays();
        controllerCallbacks.closeContentOverlays();
        controllerCallbacks.unclickArrowButton();

        controllerCallbacks.updateTaskState(new Date());
        controllerCallbacks.updateProjectState(null);

        document.body.append(env.addProjectForm.element);

        // Um atraso minúsculo para forçar o navegador a renderizar o estado original, caso contrário ele já renderiza a versão final.
        setTimeout(() => {
            env.addProjectForm.addProjectButton.classList.add('add-button-restrict');
            env.addProjectForm.element.classList.add('active');
        }, 10);
    });

    env.addProjectForm.titleInput.addEventListener('input', () => {
        const hasTitle = env.addProjectForm.titleInput.value.trim() !== '';
        env.addProjectForm.addProjectButton.classList.toggle('add-button-restrict', !hasTitle);
    });

    env.addProjectForm.cancelButton.addEventListener('click', (event) => {
        event.stopPropagation();
        controllerCallbacks.closeContentOverlays();
    });

    env.addProjectForm.element.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleText = env.addProjectForm.titleInput.value.trim();

        const newProject = createProject({
            title: titleText
        })

        currentProjectState.project = newProject;

        currentUser.addProject(newProject);

        userStorage.saveUser(currentUser);

        controllerCallbacks.closeContentOverlays();

        env.myProjectsButton.click();
        closeMenuIfMobile()
    });

    env.plusButton.addEventListener('click', (event) => {
        event.stopPropagation();

        controllerCallbacks.closeContentOverlays();

        let existingOverlay = document.querySelector('.plus-overlay-portal');

        if (!existingOverlay) {
            controllerCallbacks.closeMenuOverlays();
            controllerCallbacks.disableMenuScroll();

            env.plusButtonOverlay.classList.add('plus-overlay-portal');

            document.body.append(env.plusButtonOverlay);

            positionOverlay(env.plusButton, env.plusButtonOverlay);

            env.plusButton.classList.add('plus-button-clicked');
            controllerCallbacks.unclickArrowButton();
        } else {
            existingOverlay.remove();
            env.plusButton.classList.remove('plus-button-clicked');
        }
    });

    env.arrowButton.addEventListener('click', (event) => {
        event.stopPropagation();

        if (currentUser.projects.length >= 0) {
            let isOpen = env.arrowOverlay.classList.contains('arrow-overlay-open');

            controllerCallbacks.closeMenuOverlays();
            controllerCallbacks.closeContentOverlays();

            if (currentUser.projects.length === 0) {
                controllerCallbacks.unclickArrowButton();
                return;
            }

            if (!isOpen) {
                env.arrowOverlay.innerHTML = '';

                currentUser.projects.forEach((element) => {
                    let overlay = env.createProjectButtonDiv();
                    let button = env.createProjectButton(element.title);

                    button.addEventListener('click', () => {
                        controllerCallbacks.closeContentOverlays();
                    });

                    overlay.append(button);
                    env.arrowOverlay.append(overlay);
                });

                env.arrowOverlay.classList.add('arrow-overlay-open');
                env.arrowButton.classList.add('arrow-button-clicked');
                env.arrowButton.classList.remove('arrow-button-unclicked');
            } else {
                controllerCallbacks.unclickArrowButton();
            }
        }
    })

    env.myProjectsButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        closeMenuIfMobile()

        env.contentContainer.replaceChildren();
        env.myProjectsButton.classList.add('button-clicked');

        const hasAnyProjects = currentUser.projects.length > 0;

        if (!hasAnyProjects) {
            env.contentContainer.append(env.myProjectsViewWithoutProjects.element);
            env.myProjectsViewWithoutProjects.addProjectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.closeContentOverlays();
                controllerCallbacks.unclickArrowButton();

                controllerCallbacks.updateTaskState(new Date());
                controllerCallbacks.updateProjectState(null);

                document.body.append(env.addProjectForm.element);

                // Um atraso minúsculo para forçar o navegador a renderizar o estado original, caso contrário ele já renderiza a versão final.
                setTimeout(() => {
                    env.addProjectForm.addProjectButton.classList.add('add-button-restrict');
                    env.addProjectForm.element.classList.add('active');
                }, 10);
            });
        } else {
            const freshProjectView = env.refreshAllProjectsView();

            env.contentContainer.append(freshProjectView.element);
            freshProjectView.projectsCards.forEach(projectCard => {
                const project = currentUser.projects.find(p => p.id === projectCard.projectId);

                projectCard.deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    const deleteOverlay = env.createDeleteProjectOverlay(projectCard.projectTitle.textContent);
                    document.body.append(deleteOverlay.element);

                    setTimeout(() => {
                        deleteOverlay.element.classList.add('active');
                    }, 10);

                    deleteOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    deleteOverlay.confirmButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentUser.removeProject(projectCard.projectId);
                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();
                        env.myProjectsButton.click();
                    });
                });
            });

            freshProjectView.addProjectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                env.plusButtonOverlay.remove();
                env.plusButton.classList.remove('plus-button-clicked');

                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.closeContentOverlays();
                controllerCallbacks.unclickArrowButton();

                controllerCallbacks.updateTaskState(new Date());
                controllerCallbacks.updateProjectState(null);

                document.body.append(env.addProjectForm.element);

                // Um atraso minúsculo para forçar o navegador a renderizar o estado original, caso contrário ele já renderiza a versão final.
                setTimeout(() => {
                    env.addProjectForm.addProjectButton.classList.add('add-button-restrict');
                    env.addProjectForm.element.classList.add('active');
                }, 10);
            });
        }
    });
    // #endregion

    // #region Funções auxiliares
    function removeAllOtherButtonsClicked() {
        const buttons = env.menuContainer.querySelectorAll('.button-clicked');
        buttons.forEach((button) => button.classList.remove('button-clicked'));
    }

    function closeMenuIfMobile() {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        if (isMobile) {
            controllerCallbacks.setMenuCollapsed(true);
        }
    }

    function isTaskOverdue(task) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate < today && !task.isCompleted;
    }

    const preventScrollHandler = (e) => {
        const isInsideOverlay = e.target.closest('.overlay');

        if (isInsideOverlay) {
            const overlayContent = isInsideOverlay;
            const hasScrollableContent = overlayContent.scrollHeight > overlayContent.clientHeight;

            // Só libera o evento de roda do mouse caso ele realmente tenha lista para rolar!
            if (hasScrollableContent) {
                return; // Pula o preventDefault() e deixa ele rolar!
            }
        }

        // Se não estava em cima do overlay (ou se o overlay é pequenininho e não rola), mata tudo.
        e.preventDefault();
    }

    document.addEventListener('click', (event) => {
        const clickedInsideMenuControl = event.target.closest('.overlay, #header-button, .overlay-content, .calendar-overlay, .select-project-overlay');

        if (clickedInsideMenuControl) {
            return;
        }
        controllerCallbacks.closeMenuOverlays();
        controllerCallbacks.closeContentOverlays()
        controllerCallbacks.unclickArrowButton();
    });

    window.addEventListener('resize', () => {
        controllerCallbacks.closeMenuOverlays();
        controllerCallbacks.closeContentOverlays();
        controllerCallbacks.unclickArrowButton();
    })
    // #endregion

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    controllerCallbacks.setMenuCollapsed(isMobile);

    // Faz o botão hoje ser clicado ao carregar a página
    env.todayButton.click();
}

initDashboard();
