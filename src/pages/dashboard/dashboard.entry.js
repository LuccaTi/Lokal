import "./dashboard.entry.css";
import "../../shared/styles/global.css"
import { requireAuthenticatedUser } from "../../shared/utils/authSession.js";
import { initLayoutBlocks } from "./controllers/dashboard.layout.js";


function initDashboard() {

    const currentUser = requireAuthenticatedUser();

    if (!currentUser) return;

    console.log(`Usuário autenticado: ${currentUser.email}`);

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
            overlays.forEach((overlay) => overlay.remove());
        }
    }

    // Usuário teste
    const testUser = {
        email: 'tirellilucca@gmail.com',
        password: 'Lokal123@',
        projects: [
            {
                projectName: 'Projeto 1'
            },
            {
                projectName: 'Projeto 2'
            },
            {
                projectName: 'Projeto 3'
            },
            {
                projectName: 'Projeto 4'
            },
            {
                projectName: 'Projeto 5'
            },
            {
                projectName: 'Projeto 6'
            }
        ]
    };

    // Trocar para 'currentUser' após testes
    // Criador do menu lateral e da tela principal
    const env = initLayoutBlocks(testUser, controllerCallbacks);

    // #endregion

    // #region Ponte do menu com tela principal
    env.addTaskButton.addEventListener('click', (event) => {
        event.stopPropagation();

        controllerCallbacks.closeMenuOverlays();
        controllerCallbacks.unclickArrowButton();

        env.addTaskOverlay.addEventListener('submit', (e) => {
            e.preventDefault();
            // Próximo passo: Adicionar os overlays dos botões de data e selecionar projeto. 
            // Depois vamos integrar com a lógica de criação de tarefas (pegar os dados do formulário, etc).
        });

        env.cancelButton.addEventListener('click', (event) => {
            event.stopPropagation();
            controllerCallbacks.closeContentOverlays();
        });

        document.body.append(env.addTaskOverlay);
    });

    env.todayButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        env.contentContainer.replaceChildren();

        if (currentUser.tasks.length === 0) {
            env.contentContainer.append(env.todayViewNoTasks);
            env.todayViewAddTaskButton.addEventListener('click', () => {
                event.stopPropagation();

                controllerCallbacks.closeContentOverlays();
                controllerCallbacks.closeMenuOverlays();
                controllerCallbacks.unclickArrowButton();

                document.body.append(env.addTaskOverlay);
                env.cancelButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    controllerCallbacks.closeContentOverlays();
                });
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

    env.concludedButton.addEventListener('click', () => {
        removeAllOtherButtonsClicked();
        env.contentContainer.replaceChildren();
        env.concludedButton.classList.add('button-clicked');
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
        const clickedInsideMenuControl = event.target.closest('.overlay, #header-button, .overlay-content');

        if (clickedInsideMenuControl) {
            return;
        }
        controllerCallbacks.closeMenuOverlays();
        controllerCallbacks.closeContentOverlays()
        controllerCallbacks.unclickArrowButton();
    });

    window.addEventListener('resize', () => {
        controllerCallbacks.closeMenuOverlays();
        closeContentOverlays();
    })
    // #endregion

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    controllerCallbacks.setMenuCollapsed(isMobile);

    // Faz o botão hoje ser clicado ao carregar a página
    env.todayButton.click();
}

initDashboard();
