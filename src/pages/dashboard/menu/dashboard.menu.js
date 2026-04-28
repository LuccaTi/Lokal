import "./dashboard.menu.css";
import { authSession } from "../../../shared/utils/authSession.js";
import arrowDownIcon from "../assets/icons/menu/arrow-down-svgrepo-com.svg";
import exitIcon from "../assets/icons/menu/exit-logout-sign-out-svgrepo-com.svg";
import sidebarIcon from "../assets/icons/menu/sidebar-right-svgrepo-com.svg";
import plusCircleIcon from "../assets/icons/menu/plus-circle-svgrepo-com.svg";
import todayIcon from "../assets/icons/menu/today-outline-svgrepo-com.svg";
import shortlyIcon from "../assets/icons/menu/calendar-alt-svgrepo-com.svg";
import concludedIcon from "../assets/icons/menu/checklist-minimalistic-svgrepo-com.svg";
import plusSymbol from "../assets/icons/menu/plus-svgrepo-com.svg";

const menuCreator = {

    createHeader(user) {
        const header = document.createElement('header');
        header.classList.add('header');

        const headerButton = document.createElement('button');
        headerButton.setAttribute('type', 'button');
        headerButton.setAttribute('id', 'header-button');

        const createAvatar = (userName) => {
            const firstLetter = userName.charAt(0);
            const svgNS = 'http://www.w3.org/2000/svg';

            const svg = document.createElementNS(svgNS, 'svg');
            svg.classList.add('avatar-svg');
            svg.setAttribute('viewBox', '0 0 40 40');

            const circle = document.createElementNS(svgNS, 'circle');
            circle.classList.add('avatar-circle');
            circle.setAttribute('cx', '20');
            circle.setAttribute('cy', '20');
            circle.setAttribute('r', '20');

            const text = document.createElementNS(svgNS, 'text');
            text.classList.add('avatar-text');
            text.setAttribute('x', '50%');
            text.setAttribute('y', '50%');
            text.textContent = firstLetter;

            svg.append(circle, text);
            return svg;
        };

        const userName = user.email.split('@').map(part => part.charAt(0).toUpperCase() + part.slice(1)).shift();
        const avatar = createAvatar(userName);
        const arrowIcon = document.createElement('img');
        arrowIcon.src = arrowDownIcon;
        arrowIcon.alt = 'Arrow icon';
        arrowIcon.setAttribute('id', 'arrow-icon');

        headerButton.append(avatar, userName, arrowIcon);

        const createOverlay = (user) => {
            const div = document.createElement('div');
            div.classList.add('overlay');

            const dividerTop = document.createElement('div');
            dividerTop.classList.add('overlay-divider');

            const button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.setAttribute('id', 'logout-button');
            button.addEventListener('click', () => {
                authSession.logout();
            });

            const icon = document.createElement('img');
            icon.src = exitIcon;
            icon.setAttribute('id', 'exit-icon');

            const dividerBottom = document.createElement('div');
            dividerBottom.classList.add('overlay-divider');

            button.append(icon, 'Sair');

            div.append(dividerTop, button, dividerBottom);
            return div;
        };
        headerButton.addEventListener('click', (event) => {
            event.stopPropagation();

            let existingOverlay = header.querySelector('.overlay');

            if (!existingOverlay) {
                const overlay = createOverlay(user);
                header.append(overlay);
                headerButton.classList.add('active');
            } else {
                existingOverlay.remove();
                headerButton.classList.remove('active');
            }
        });

        header.append(headerButton);
        return header;
    },

    createSideButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button', 'side');

        const icon = document.createElement('img');
        icon.src = sidebarIcon;
        icon.classList.add('menu-icon');

        button.append(icon);
        return button;
    },

    createAddTaskButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button', 'add-task');

        const icon = document.createElement('img');
        icon.src = plusCircleIcon;
        icon.alt = 'Plus circle icon';
        icon.classList.add('menu-icon');

        button.append(icon, 'Adicionar tarefa');
        return button;
    },

    createTodayButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button');

        const icon = document.createElement('img');
        icon.src = todayIcon;
        icon.alt = 'Today icon';
        icon.classList.add('menu-icon');

        button.append(icon, 'Hoje');
        return button;
    },

    createShortlyButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button');

        const icon = document.createElement('img');
        icon.src = shortlyIcon;
        icon.alt = 'Shortly icon';
        icon.classList.add('menu-icon');

        button.append(icon, 'Em breve');
        return button;
    },

    createConcludedButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button');

        const icon = document.createElement('img');
        icon.src = concludedIcon;
        icon.alt = 'Concluded icon';
        icon.classList.add('menu-icon');

        button.append(icon, 'Concluídos');
        return button;
    },

    createProjectsButtonsWrapper() {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('id', 'projects-buttons-container');
        return wrapper;
    },

    createProjectsButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button');
        button.textContent = 'Meus projetos';
        return button;
    },

    createPlusButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('id', 'plus-button');
        button.classList.add('menu-button');
        
        const icon = document.createElement('img');
        icon.src = plusSymbol;
        icon.alt = 'Plus symbol';
        icon.classList.add('menu-icon');

        button.append(icon);

        return button;
    },

    createArrowButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('id', 'arrow-button');
        button.classList.add('menu-button');
        
        const icon = document.createElement('img');
        icon.src = arrowDownIcon;
        icon.alt = 'Arrow icon';
        icon.classList.add('menu-icon');

        button.append(icon);

        return button;
    }
}

export { menuCreator };