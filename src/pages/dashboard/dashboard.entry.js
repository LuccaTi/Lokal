import "./dashboard.entry.css";
import "../../shared/styles/global.css"
import { requireAuthenticatedUser } from "../../shared/utils/authSession.js";
import { initLayoutBlocks } from "./controllers/dashboard.layout.js";
import { createTask } from "../../core/domain/task.js";
import { userStorage } from "../../core/storage/userStorage.js";
import { createUser } from "../../core/domain/user.js";
import { formatDateForButton } from "../../shared/utils/dateUtils.js";

// Próximos passos:
// Criar mais um botão de adicionar tarefa abaixo da última tarefa adicionada. TODO
// Criar a view do botão 'Em breve'. TODO
// Criar a view do botão 'Histórico', onde serão enviadas as tarefas concluídas. TODO

function initDashboard() {

    const currentUser = requireAuthenticatedUser();

    if (!currentUser) return;

    console.log(`Usuário autenticado: ${currentUser.email}`);

    const currentTaskState = {
        dueDate: new Date(),
    };

    const currentProjectState = {
        project: null,
    }

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

        closeEllipsisOverlays: () => {
            const ellipsisOverlays = document.querySelectorAll('.ellipsis-overlay-portal');
            ellipsisOverlays.forEach((overlay) => overlay.remove());

            const activeEllipsis = document.querySelectorAll('.ellipsis-button-clicked');
            activeEllipsis.forEach((btn) => btn.classList.remove('ellipsis-button-clicked'));

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

        document.body.append(env.addTaskForm.element);

        // Um atraso minúsculo para forçar o navegador a renderizar o estado original, caso contrário ele já renderiza a versão final.
        setTimeout(() => {
            env.addTaskForm.addTaskButton.classList.add('add-task-button-restrict');
            env.addTaskForm.element.classList.add('active');
        }, 10);
    });

    env.addTaskForm.titleInput.addEventListener('input', () => {
        const hasTitle = env.addTaskForm.titleInput.value.trim() !== '';
        env.addTaskForm.addTaskButton.classList.toggle('add-task-button-restrict', !hasTitle);
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

        env.todayButton.click();
    });

    env.todayButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        env.contentContainer.replaceChildren();

        if (currentUser.tasks.length === 0) {
            env.contentContainer.append(env.todayViewNoTasks);

            env.todayViewAddTaskButton.addEventListener('click', (event) => {
                event.stopPropagation();

                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.unclickArrowButton();

                document.body.append(env.addTaskForm.element);

                setTimeout(() => {
                    env.addTaskForm.element.classList.add('active');
                }, 10);
            });
        } else {
            const freshView = env.refreshTodayView();

            env.contentContainer.append(freshView.element);

            freshView.taskViewsWithoutProject.forEach(taskView => {
                taskView.checkbox.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        console.log(`Tarefa "${taskView.taskTitle.textContent}" marcada como concluída.`);
                        // Restante da lógica para marcar a tarefa como concluída, como atualizar o estado da tarefa, mover para uma seção de tarefas concluídas, etc.
                    } else {
                        console.log(`Tarefa "${taskView.taskTitle.textContent}" desmarcada como concluída.`);
                    }
                });

                taskView.editButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeMenuOverlays();
                    controllerCallbacks.closeContentOverlays();

                    const projectName = null;
                    let taskToEdit = null;
                    if (currentProjectState.project === null) {
                        taskToEdit = currentUser.tasks.find(task => task.id === taskView.taskId);
                    } else {
                        // Faz a busca da tarefa dentro do projeto específico, caso esteja vindo da seção de um projeto. TODO
                    }

                    if (!taskToEdit) return;

                    const date = formatDateForButton(taskToEdit.dueDate);

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
                            updatedTitle = taskToEdit.title;
                        }

                        if (updatedDescription === '') {
                            updatedDescription = taskToEdit.description;
                        }

                        taskToEdit.updateTitle(updatedTitle);
                        taskToEdit.updateDescription(updatedDescription);
                        taskToEdit.updateDueDate(currentTaskState.dueDate);

                        userStorage.saveUser(currentUser);
                        controllerCallbacks.closeContentOverlays();
                        env.todayButton.click();
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
        }

        env.todayButton.classList.add('button-clicked');
    });

    env.shortlyButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        env.contentContainer.replaceChildren();
        env.shortlyButton.classList.add('button-clicked');
    });

    env.historyButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        env.contentContainer.replaceChildren();
        env.historyButton.classList.add('button-clicked');
    });

    env.myProjectsButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        env.contentContainer.replaceChildren();
        env.myProjectsButton.classList.add('button-clicked');
    });
    // #endregion

    // #region Funções auxiliares
    function removeAllOtherButtonsClicked() {
        const buttons = env.menuContainer.querySelectorAll('.button-clicked');
        buttons.forEach((button) => button.classList.remove('button-clicked'));
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
