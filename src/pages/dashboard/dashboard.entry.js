import "./dashboard.entry.css";
import "../../shared/styles/global.css"
import { requireAuthenticatedUser } from "../../shared/utils/authSession.js";
import { initLayoutBlocks } from "./controllers/dashboard.layout.js";
import { createTask } from "../../core/domain/task.js";
import { userStorage } from "../../core/storage/userStorage.js";


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
                        if(overlay === env.addTaskForm.element) {
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

        updateTaskState(date){
            currentTaskState.dueDate = date;
        },

        updateProjectState(project){
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

        env.dateButtonOverlay.resetCalendar();
        document.body.append(env.dateButtonOverlay);
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
        // Próximos passos: Pegar os dados do formulário para criar tarefas sem projeto. OK
        // Criar a view que mostra as tarefas sem projeto do usuário. TODO


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
    });

    env.todayButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        env.contentContainer.replaceChildren();

        if (currentUser.tasks.length === 0) {
            env.contentContainer.append(env.todayViewNoTasks);

            // O botão de criar tarefa DO MEIO DA TELA precisa deste (event) para não quebrar no stopPropagation!
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
            env.contentContainer.append(env.todayViewWithTasks);
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
