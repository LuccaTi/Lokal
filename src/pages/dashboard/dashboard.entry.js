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

// ETAPA ATUAL: Fase de testes e ajustes

function initDashboard() {

    const currentUser = requireAuthenticatedUser();

    if (!currentUser) return;

    console.log(`Usuário autenticado: ${currentUser.email}`);

    const currentTaskState = {
        dueDate: new Date()
    };

    const currentProjectState = {
        project: null,
        projectId: ''
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
                            currentProjectState.projectId = '';
                        }
                        if (overlay === env.addProjectForm.element) {
                            env.addProjectForm.resetForm();
                            currentTaskState.dueDate = new Date();
                            currentProjectState.project = null;
                            currentProjectState.projectId = '';
                        }
                    }, 300);
                } else {
                    overlay.remove();
                }
            });

            this.closeCalendarOverlay();
        },

        resetTaskAndProjectState() {
            currentTaskState.dueDate = new Date();
            currentProjectState.project = null;
            currentProjectState.projectId = '';
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

            if (project !== null) {
                currentProjectState.projectId = project.id;
            } else {
                currentProjectState.projectId = '';
            }
        }
    }

    // Criador do menu lateral e da tela principal
    const env = initLayoutBlocks(currentUser, controllerCallbacks);

    // #endregion

    // #region Ponte do menu com tela principal

    // Form de adicionar tarefa
    env.addTaskButton.addEventListener('click', (event) => {
        event.stopPropagation();

        const form = document.querySelector('[data-js="add-task-form"]');
        if (form) return;

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

    addListenersToAddTaskForms(
        env.addTaskForm.titleInput,
        env.addTaskForm.descriptionInput,
        env.addTaskForm.dateButton,
        env.addTaskForm.selectProjectButton,
        env.addTaskForm.cancelButton,
        env.addTaskForm.element,
        env.addTaskForm.addTaskButton
    );

    env.todayButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        closeMenuIfMobile()
        env.contentContainer.replaceChildren();

        const today = new Date().setHours(0, 0, 0, 0);

        const hasTasksForTodayWithoutProjects = currentUser.tasks.some(task => {
            const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);

            return taskDueDate === today && !task.isCompleted;
        });

        const hasOverdueTasksWithoutProjects = currentUser.tasks.some(task => {
            const taskDueDate = new Date(task.dueDate).setHours(0, 0, 0, 0);

            return taskDueDate < today && !task.isCompleted;
        });

        const hasTasksForTodayFromProjects = currentUser.projects
            .flatMap(project => project.tasks)
            .some(task => {
                const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                return taskDate === today && !task.isCompleted;
            });

        const hasOverdueTasksFromProjects = currentUser.projects
            .flatMap(project => project.tasks)
            .some(task => {
                const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                return taskDate < today && !task.isCompleted;
            });

        let renderTodayViewNoTasks = !hasTasksForTodayWithoutProjects && !hasOverdueTasksWithoutProjects && !hasTasksForTodayFromProjects && !hasOverdueTasksFromProjects

        if (renderTodayViewNoTasks) {
            env.contentContainer.append(env.todayViewNoTasks);

            env.todayViewAddTaskButton.addEventListener('click', (event) => {
                event.stopPropagation();

                const form = document.querySelector('[data-js="add-task-form"]');
                if (form) return;

                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.closeContentOverlays();
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

            freshViewToday.allTasksViews.forEach(taskView => {

                let task = null;
                if (taskView.fromProject) {
                    for (const project of currentUser.projects) {
                        const foundTask = project.tasks.find(t => t.id === taskView.taskId);
                        if (foundTask) {
                            task = foundTask;
                            break;
                        } else {
                            console.error(`A tarefa com id ${taskView.taskId} não foi encontrada em projeto algum!`);
                        }
                    }
                } else {
                    task = currentUser.tasks.find(task => task.id === taskView.taskId);
                }

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
                    controllerCallbacks.unclickArrowButton();
                    closeMenuIfMobile();

                    if (!task) return;

                    controllerCallbacks.updateTaskState(task.dueDate);

                    if (taskView.fromProject) {
                        const foundProject = currentUser.projects.find(project =>
                            project.tasks.some(t => t.id === taskView.taskId)
                        );
                        controllerCallbacks.updateProjectState(foundProject);
                    } else {
                        controllerCallbacks.updateProjectState(null);
                    }

                    const date = formatDateForButton(task.dueDate);

                    let editOverlay = null;
                    if (taskView.fromProject) {
                        editOverlay = env.createEditTaskFormProjects(task.id, currentProjectState.projectId);
                    } else {
                        editOverlay = env.createEditTaskFormTasks(task.id);
                    }

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

                        task.updateTitle(updatedTitle);
                        task.updateDescription(updatedDescription);
                        task.updateDueDate(currentTaskState.dueDate);

                        moveTaskToSelectedProject(task);

                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();

                        const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                        const todayDate = new Date().setHours(0, 0, 0, 0);

                        if (currentProjectState.project !== null) {
                            controllerCallbacks.resetTaskAndProjectState();

                            removeAllOtherButtonsClicked();
                            closeMenuIfMobile()
                            env.myProjectsButton.classList.add('button-clicked');

                            return;
                        }

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
                        if (taskView.fromProject) {
                            const project = currentUser.projects.find(p => p.tasks.some(t => t.id === taskView.taskId));
                            project.removeTask(taskView.taskId);
                        } else {
                            currentUser.removeTask(taskView.taskId);
                        }
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

        const hasFutureIncompleteTasksWithoutProjects = currentUser.tasks.some(task => {
            const isFutureDateAndIncomplete = new Date(task.dueDate).setHours(0, 0, 0, 0) > today && !task.isCompleted;
            return isFutureDateAndIncomplete;
        });

        const hasFutureIncompleteTasksFromProjects = currentUser.projects
            .flatMap(project => project.tasks)
            .some(task => {
                const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                return taskDate > today && !task.isCompleted;
            });

        if (!hasFutureIncompleteTasksWithoutProjects && !hasFutureIncompleteTasksFromProjects) {
            env.contentContainer.append(env.shortlyViewNoTasks);
        } else {
            const freshViewShortly = env.refreshShortlyView();

            env.contentContainer.append(freshViewShortly.element);

            freshViewShortly.allTasksViews.forEach(taskView => {
                let task = null;
                if (taskView.fromProject) {
                    for (const project of currentUser.projects) {
                        const foundTask = project.tasks.find(t => t.id === taskView.taskId);
                        if (foundTask) {
                            task = foundTask;
                            break;
                        }
                    }
                } else {
                    task = currentUser.tasks.find(task => task.id === taskView.taskId);
                }

                taskView.checkbox.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        task.toggleStatus(new Date());
                    } else {
                        task.toggleStatus(null);
                    }

                    userStorage.saveUser(currentUser);

                    env.shortlyButton.click();
                });

                taskView.editButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();
                    controllerCallbacks.unclickArrowButton();
                    closeMenuIfMobile();

                    if (!task) return;

                    controllerCallbacks.updateTaskState(task.dueDate);
                    if (taskView.fromProject) {
                        const foundProject = currentUser.projects.find(project =>
                            project.tasks.some(t => t.id === taskView.taskId)
                        );
                        controllerCallbacks.updateProjectState(foundProject);
                    } else {
                        controllerCallbacks.updateProjectState(null);
                    }

                    const date = formatDateForButton(task.dueDate);

                    let editOverlay = null;
                    if (taskView.fromProject) {
                        editOverlay = env.createEditTaskFormProjects(task.id, currentProjectState.projectId);
                    } else {
                        editOverlay = env.createEditTaskFormTasks(task.id);
                    }

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

                        task.updateTitle(updatedTitle);
                        task.updateDescription(updatedDescription);
                        task.updateDueDate(currentTaskState.dueDate);

                        moveTaskToSelectedProject(task);

                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();

                        const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
                        const todayDate = new Date().setHours(0, 0, 0, 0);

                        if (currentProjectState.project !== null) {
                            controllerCallbacks.resetTaskAndProjectState();

                            removeAllOtherButtonsClicked();
                            closeMenuIfMobile()
                            env.myProjectsButton.classList.add('button-clicked');

                            return;
                        }

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
                        if (taskView.fromProject) {
                            const project = currentUser.projects.find(p => p.tasks.some(t => t.id === taskView.taskId));
                            project.removeTask(taskView.taskId);
                        } else {
                            currentUser.removeTask(taskView.taskId);
                        }
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

            const groupedItems = env.getGroupedHistoryItems();

            if (groupedItems.length === 0) {
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
                if (historyMonthIndex < groupedItems.length - 1) {
                    historyMonthIndex++;
                    renderCurrentHistoryMonth();
                }
            });

            historyView.completedItemViews.forEach(itemView => {
                if (itemView.type === 'task') {
                    const task = currentUser.tasks.find(t => t.id === itemView.taskId);
                    if (!task) return;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const completedDate = new Date(task.completedDate);
                    completedDate.setHours(0, 0, 0, 0);

                    const daysAgoCompleted = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
                    const warningOverlay = env.createTaskCompletedWarning(daysAgoCompleted);
                    itemView.view.element.append(warningOverlay);

                    itemView.view.deleteButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        controllerCallbacks.closeMenuOverlays();
                        controllerCallbacks.closeContentOverlays();

                        const deleteOverlay = env.createDeleteTaskOverlay(itemView.view.taskTitle.textContent);
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
                            currentUser.removeTask(itemView.taskId);
                            userStorage.saveUser(currentUser);
                            controllerCallbacks.closeContentOverlays();

                            const updatedGroupedItems = env.getGroupedHistoryItems();
                            if (updatedGroupedItems.length === 0) {
                                env.contentContainer.replaceChildren(env.historyViewNoTasks);
                                return;
                            }

                            if (historyMonthIndex >= updatedGroupedItems.length) {
                                historyMonthIndex = updatedGroupedItems.length - 1;
                            }

                            renderCurrentHistoryMonth();
                        });
                    });
                }

                if (itemView.type === 'project') {
                    const project = currentUser.projects.find(p => p.id === itemView.projectId);
                    if (!project) return;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const completedDate = new Date(project.completedDate);
                    completedDate.setHours(0, 0, 0, 0);

                    const daysAgoCompleted = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
                    const warningOverlay = env.createProjectCompletedWarning(daysAgoCompleted);
                    itemView.view.element.append(warningOverlay);

                    itemView.view.deleteButton.addEventListener('click', (event) => {
                        event.stopPropagation();
                        controllerCallbacks.closeMenuOverlays();
                        controllerCallbacks.closeContentOverlays();

                        const deleteOverlay = env.createDeleteProjectOverlay(itemView.view.projectTitle.textContent);
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
                            currentUser.removeProject(itemView.projectId);
                            userStorage.saveUser(currentUser);
                            controllerCallbacks.closeContentOverlays();

                            const updatedGroupedItems = env.getGroupedHistoryItems();
                            if (updatedGroupedItems.length === 0) {
                                env.contentContainer.replaceChildren(env.historyViewNoTasks);
                                return;
                            }

                            if (historyMonthIndex >= updatedGroupedItems.length) {
                                historyMonthIndex = updatedGroupedItems.length - 1;
                            }

                            renderCurrentHistoryMonth();
                        });
                    });
                }
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

        const hasIncompleteProjects = currentUser.projects.some(p => !p.isCompleted);

        if (hasIncompleteProjects) {
            let isOpen = env.arrowOverlay.classList.contains('arrow-overlay-open');

            controllerCallbacks.closeMenuOverlays();
            controllerCallbacks.closeContentOverlays();

            if (currentUser.projects.length === 0) {
                controllerCallbacks.unclickArrowButton();
                return;
            }

            if (!isOpen) {
                env.arrowOverlay.innerHTML = '';

                currentUser.projects.forEach((project) => {
                    if (!project.isCompleted) {
                        let overlay = env.createProjectButtonDiv();
                        let button = env.createProjectButton(project.title);

                        button.addEventListener('click', () => {
                            event.stopPropagation();

                            controllerCallbacks.closeMenuOverlays();
                            controllerCallbacks.closeContentOverlays();
                            controllerCallbacks.unclickArrowButton();
                            removeAllOtherButtonsClicked();
                            closeMenuIfMobile();
                            env.myProjectsButton.classList.add('button-clicked');

                            controllerCallbacks.updateProjectState(project);

                            const projectView = env.refreshProjectView(project.id);
                            if (!projectView) return;

                            env.contentContainer.replaceChildren(projectView.element);
                            attachProjectViewListeners(projectView, project, currentProjectState.projectId);

                            renderCurrentProjectView();
                        });

                        overlay.append(button);
                        env.arrowOverlay.append(overlay);
                    }
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

        const hasAnyUnfinishedProjects = currentUser.projects.some((project) => project.isCompleted === false);

        if (!hasAnyUnfinishedProjects) {
            env.contentContainer.append(env.myProjectsViewWithoutProjects.element);
            env.myProjectsViewWithoutProjects.addProjectButton.addEventListener('click', (e) => {
                e.stopPropagation();
                env.plusButtonOverlay.remove();
                env.plusButton.classList.remove('plus-button-clicked');

                const form = document.querySelector('[data-js="add-project-form"]');
                if (form) return;

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

                projectCard.projectTitle.style.cursor = 'pointer';

                projectCard.projectTitle.addEventListener('click', (event) => {
                    event.stopPropagation();

                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();
                    controllerCallbacks.unclickArrowButton();
                    removeAllOtherButtonsClicked();
                    closeMenuIfMobile();
                    env.myProjectsButton.classList.add('button-clicked');

                    controllerCallbacks.updateProjectState(project);

                    const projectView = env.refreshProjectView(projectCard.projectId);
                    if (!projectView) return;

                    env.contentContainer.replaceChildren(projectView.element);
                    attachProjectViewListeners(projectView, project, currentProjectState.projectId);
                });

                projectCard.checkbox.addEventListener('change', (event) => {
                    if (!project) return;

                    if (event.target.checked) {
                        const pendingTasksCount = project.tasks.filter((task) => !task.isCompleted).length;

                        if (pendingTasksCount > 0) {
                            event.target.checked = false;
                            controllerCallbacks.closeContentOverlays();

                            const pendingTasksWarningOverlay = env.createPendingTasksWarningOverlay(
                                project.title,
                                pendingTasksCount
                            );

                            document.body.append(pendingTasksWarningOverlay.element);

                            setTimeout(() => {
                                pendingTasksWarningOverlay.element.classList.add('active');
                            }, 10);

                            pendingTasksWarningOverlay.cancelButton.addEventListener('click', (e) => {
                                e.stopPropagation();
                                controllerCallbacks.closeContentOverlays();
                            });

                            return;
                        }

                        project.toggleStatus(new Date());
                    } else {
                        project.toggleStatus(null);
                    }

                    userStorage.saveUser(currentUser);
                    controllerCallbacks.closeContentOverlays();
                    env.myProjectsButton.click();
                });

                projectCard.editButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    if (!projectCard) return;

                    controllerCallbacks.updateTaskState(new Date());
                    controllerCallbacks.updateProjectState(project);

                    const editOverlay = env.createEditProjectForm(project.id);

                    document.body.append(editOverlay.element);

                    setTimeout(() => {
                        editOverlay.element.classList.add('active');
                    }, 10);

                    editOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    editOverlay.element.addEventListener('submit', (e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        let updatedTitle = editOverlay.titleInput.value.trim();

                        if (updatedTitle === '') {
                            updatedTitle = project.title;
                        }

                        project.updateTitle(updatedTitle);

                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();

                        env.myProjectsButton.click();
                    });
                });

                projectCard.deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    const pendingTasksCount = project.tasks.filter(t => !t.isCompleted).length;

                    let deleteOverlay;
                    if (pendingTasksCount > 0) {
                        deleteOverlay = env.createDeleteProjectPendingOverlay(project.title, pendingTasksCount);
                    } else {
                        deleteOverlay = env.createDeleteProjectOverlay(projectCard.projectTitle.textContent);
                    }

                    document.body.append(deleteOverlay.element);

                    setTimeout(() => {
                        deleteOverlay.element.classList.add('active');
                    }, 10);

                    deleteOverlay.cancelButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        controllerCallbacks.closeContentOverlays();
                    });

                    if (deleteOverlay.confirmButton) {
                        deleteOverlay.confirmButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            currentUser.removeProject(projectCard.projectId);
                            userStorage.saveUser(currentUser);
                            controllerCallbacks.closeContentOverlays();
                            env.myProjectsButton.click();
                        });
                    }
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
    function addListenersToAddTaskForms(
        titleInputElement,
        descriptionInputElement,
        dateButtonElement,
        selectProjectButtonElement,
        cancelButtonElement,
        addTaskFormElement,
        addTaskButtonElement
    ) {
        titleInputElement.addEventListener('input', () => {
            const hasTitle = titleInputElement.value.trim() !== '';
            addTaskButtonElement.classList.toggle('add-button-restrict', !hasTitle);
        });

        dateButtonElement.addEventListener('click', (event) => {
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

        selectProjectButtonElement.addEventListener('click', (event) => {
            event.stopPropagation();
            controllerCallbacks.closeCalendarOverlay();

            const existingOverlay = document.querySelector('.select-project-overlay');
            if (existingOverlay) {
                existingOverlay.remove();
                return;
            }

            document.body.append(env.refreshSelectProjectButtonOverlay());
        });

        cancelButtonElement.addEventListener('click', (event) => {
            event.stopPropagation();
            controllerCallbacks.closeContentOverlays();
        });

        addTaskFormElement.addEventListener('submit', (e) => {
            e.preventDefault();

            const titleText = titleInputElement.value.trim();
            const descriptionText = descriptionInputElement.value.trim();
            const selectedProject = currentProjectState.project;

            const newTask = createTask({
                title: titleText,
                description: descriptionText,
                dueDate: currentTaskState.dueDate,
            })

            if (selectedProject) {
                selectedProject.addTask(newTask);
            } else {
                currentUser.addTask(newTask);
            }

            userStorage.saveUser(currentUser);

            controllerCallbacks.closeContentOverlays();

            if (selectedProject) {
                removeAllOtherButtonsClicked();
                closeMenuIfMobile()

                env.contentContainer.replaceChildren();
                env.myProjectsButton.classList.add('button-clicked');
                renderCurrentProjectView();
            } else {
                const taskDate = new Date(newTask.dueDate).setHours(0, 0, 0, 0);
                const today = new Date().setHours(0, 0, 0, 0);
                if (taskDate === today) {
                    env.todayButton.click();
                } else {
                    env.shortlyButton.click();
                }
            }

            closeMenuIfMobile()
        });
    }

    function attachProjectViewListeners(view, projectItem, projectId) {
        view.taskViews.forEach((taskView) => {
            const task = projectItem.tasks.find((taskItem) => taskItem.id === taskView.taskId);

            if (!task) return;

            if (task.isCompleted) {
                const existingLateWarning = taskView.element.querySelector('.task-warning-overlay-late');
                if (existingLateWarning) {
                    existingLateWarning.remove();
                }

                taskView.checkbox.checked = true;
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const completedDate = new Date(task.completedDate);
                completedDate.setHours(0, 0, 0, 0);

                const daysAgoCompleted = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
                const warningOverlay = env.createTaskCompletedWarning(daysAgoCompleted);
                warningOverlay.classList.add('task-warning-overlay-complete');
                taskView.element.append(warningOverlay);

                taskView.editButton.classList.add('edit-button-restrict');
            } else {
                const existingCompletedWarning = taskView.element.querySelector('.task-warning-overlay-complete');
                if (existingCompletedWarning) {
                    existingCompletedWarning.remove();
                }

                if (isTaskOverdue(task)) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const dueDate = new Date(task.dueDate);
                    dueDate.setHours(0, 0, 0, 0);

                    const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                    const warningOverlay = env.createTaskLateWarning(daysLate);
                    warningOverlay.classList.add('task-warning-overlay-late');
                    taskView.element.append(warningOverlay);
                }

                taskView.editButton.classList.remove('edit-button-restrict');
            }

            taskView.checkbox.addEventListener('change', (event) => {
                if (event.target.checked) {
                    task.toggleStatus(new Date());

                    const existingLateWarning = taskView.element.querySelector('.task-warning-overlay-late');
                    if (existingLateWarning) existingLateWarning.remove();

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const completedDate = new Date(task.completedDate);
                    completedDate.setHours(0, 0, 0, 0);

                    const daysAgoCompleted = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
                    const warningOverlay = env.createTaskCompletedWarning(daysAgoCompleted);
                    warningOverlay.classList.add('task-warning-overlay-complete');

                    taskView.element.append(warningOverlay);
                } else {
                    task.toggleStatus(null);

                    const existingCompletedWarning = taskView.element.querySelector('.task-warning-overlay-complete');
                    if (existingCompletedWarning) existingCompletedWarning.remove();

                    if (isTaskOverdue(task)) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const dueDate = new Date(task.dueDate);
                        dueDate.setHours(0, 0, 0, 0);

                        const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                        const warningOverlay = env.createTaskLateWarning(daysLate);
                        warningOverlay.classList.add('task-warning-overlay-late');
                        taskView.element.append(warningOverlay);
                    }

                }

                userStorage.saveUser(currentUser);
                renderCurrentProjectView();
            });

            taskView.editButton.addEventListener('click', (editEvent) => {
                editEvent.stopPropagation();
                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.closeContentOverlays();

                controllerCallbacks.updateTaskState(task.dueDate);
                controllerCallbacks.updateProjectState(projectItem);

                const editOverlay = env.createEditTaskFormProjects(task.id, projectId);
                if (!editOverlay) return;

                document.body.append(editOverlay.element);

                setTimeout(() => {
                    editOverlay.element.classList.add('active');
                }, 10);

                editOverlay.dateButton.addEventListener('click', (dateEvent) => {
                    dateEvent.stopPropagation();
                    controllerCallbacks.closeSelectProjectOverlay();

                    const existingOverlay = document.querySelector('.calendar-overlay');
                    if (existingOverlay) {
                        existingOverlay.remove();
                        return;
                    }

                    editOverlay.dateButtonOverlayEditTask.resetCalendar();
                    document.body.append(editOverlay.dateButtonOverlayEditTask);
                });

                editOverlay.selectProjectButton.addEventListener('click', (projectEvent) => {
                    projectEvent.stopPropagation();
                    controllerCallbacks.closeCalendarOverlay();

                    const existingOverlay = document.querySelector('.select-project-overlay');
                    if (existingOverlay) {
                        existingOverlay.remove();
                        return;
                    }

                    document.body.append(editOverlay.selectProjectButtonOverlayEditTask);
                });

                editOverlay.cancelButton.addEventListener('click', (cancelEvent) => {
                    cancelEvent.stopPropagation();
                    controllerCallbacks.closeContentOverlays();
                });

                editOverlay.element.addEventListener('submit', (submitEvent) => {
                    submitEvent.stopPropagation();
                    submitEvent.preventDefault();

                    let updatedTitle = editOverlay.titleInput.value.trim();
                    let updatedDescription = editOverlay.descriptionInput.value.trim();

                    if (updatedTitle === '') {
                        updatedTitle = task.title;
                    }

                    task.updateTitle(updatedTitle);
                    task.updateDescription(updatedDescription);
                    task.updateDueDate(currentTaskState.dueDate);

                    const today = new Date().setHours(0, 0, 0, 0);
                    const dueDate = new Date(currentTaskState.dueDate).setHours(0, 0, 0, 0);

                    moveTaskToSelectedProject(task);

                    userStorage.saveUser(currentUser);
                    controllerCallbacks.closeContentOverlays();
                    renderCurrentProjectView();

                    if (currentProjectState.project == null) {
                        if (today >= dueDate) {
                            env.todayButton.click();
                        } else {
                            env.shortlyButton.click();
                        }
                    }
                });
            });

            taskView.deleteButton.addEventListener('click', (deleteEvent) => {
                deleteEvent.stopPropagation();
                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.closeContentOverlays();

                const deleteOverlay = env.createDeleteTaskOverlay(taskView.taskTitle.textContent);
                document.body.append(deleteOverlay.element);

                setTimeout(() => {
                    deleteOverlay.element.classList.add('active');
                }, 10);

                deleteOverlay.cancelButton.addEventListener('click', (cancelEvent) => {
                    cancelEvent.stopPropagation();
                    controllerCallbacks.closeContentOverlays();
                });

                deleteOverlay.confirmButton.addEventListener('click', (confirmEvent) => {
                    confirmEvent.stopPropagation();
                    projectItem.removeTask(taskView.taskId);
                    userStorage.saveUser(currentUser);
                    controllerCallbacks.closeContentOverlays();
                    renderCurrentProjectView();
                });
            });
        });
    }

    function renderCurrentProjectView() {
        const freshProjectView = env.refreshProjectView(currentProjectState.projectId);

        const freshProject = currentUser.projects.find(p => p.id === currentProjectState.projectId);
        if (!freshProjectView || !freshProject) return;

        env.contentContainer.replaceChildren(freshProjectView.element);

        attachProjectViewListeners(freshProjectView, freshProject, currentProjectState.projectId);
    }

    function moveTaskToSelectedProject(task) {
        const selectedProject = currentProjectState.project;
        const selectedProjectId = currentProjectState.projectId;
        const oldProject = currentUser.projects.find(p => p.tasks.some(t => t.id === task.id));
        const inUserTasks = currentUser.tasks.some(t => t.id === task.id);

        if (oldProject) {
            if (!selectedProject) {
                oldProject.removeTask(task.id);
                currentUser.addTask(task);
            } else if (selectedProject.id !== oldProject.id) {
                oldProject.removeTask(task.id);
                selectedProject.addTask(task);
            }
        } else if (inUserTasks) {
            if (selectedProject) {
                currentUser.removeTask(task.id);
                selectedProject.addTask(task);
            }
        } else {
            if (selectedProject) {
                selectedProject.addTask(task);
            } else {
                currentUser.addTask(task);
            }
        }

        if (selectedProject) {
            renderCurrentProjectView();
        }
    }

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
