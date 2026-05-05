import "./dashboard.menu.css";
import { logout } from "../../../shared/utils/authSession.js";
import arrowDownIcon from "../assets/icons/menu/arrow-down-svgrepo-com.svg";
import exitIcon from "../assets/icons/menu/exit-logout-sign-out-svgrepo-com.svg";
import sidebarIcon from "../assets/icons/menu/sidebar-right-svgrepo-com.svg";
import plusCircleIcon from "../assets/icons/menu/plus-circle-svgrepo-com.svg";
import todayIcon from "../assets/icons/menu/today-outline-svgrepo-com.svg";
import shortlyIcon from "../assets/icons/menu/calendar-alt-svgrepo-com.svg";
import concludedIcon from "../assets/icons/menu/checklist-minimalistic-svgrepo-com.svg";
import plusSymbol from "../assets/icons/menu/plus-svgrepo-com.svg";
import historySymbol from "../assets/icons/menu/history-svgrepo-com.svg";
import hashtagSymbol from "../assets/icons/menu/hashtag-svgrepo-com.svg";
import dotsSymbol from "../assets/icons/menu/dot-menu-more-2-svgrepo-com.svg";
import pencilSymbol from "../assets/icons/menu/pencil-svgrepo-com.svg";
import crossSymbol from "../assets/icons/menu/cross-svgrepo-com.svg";

const menuCreator = {

    createHeader(user) {
        const header = document.createElement('header');
        header.classList.add('header');
        return header;
    },

    createHeaderButton(user) {
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

        return headerButton;
    },

    createHeaderOverlay(user) {
        const div = document.createElement('div');
        div.classList.add('overlay');

        const dividerTop = document.createElement('div');
        dividerTop.classList.add('overlay-divider');

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('id', 'logout-button');
        button.addEventListener('click', () => {
            logout();
        });

        const icon = document.createElement('img');
        icon.src = exitIcon;
        icon.setAttribute('id', 'exit-icon');

        const dividerBottom = document.createElement('div');
        dividerBottom.classList.add('overlay-divider');

        button.append(icon, 'Sair');

        div.append(dividerTop, button, dividerBottom);
        return div;
    },

    createMenuTop() {
        const div = document.createElement('div');
        div.classList.add('menu-top');
        return div;
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

    createMyProjectsButton() {
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

    createPlusButtonOverlay() {
        const div = document.createElement('div');
        div.classList.add('overlay');

        const dividerTop = document.createElement('div');
        dividerTop.classList.add('overlay-divider');

        const icon = document.createElement('img');
        icon.src = hashtagSymbol;
        icon.classList.add('menu-icon');

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('overlay-button');

        const dividerBottom = document.createElement('div');
        dividerBottom.classList.add('overlay-divider');

        button.append(icon, 'Adicionar projeto');

        div.append(dividerTop, button, dividerBottom);
        return div;
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
    },

    createArrowButtonOverlay() {
        const div = document.createElement('div');
        div.classList.add('overlay');
        div.setAttribute('id', 'arrow-button-overlay');
        return div;
    },

    createProjectButtonDiv() {
        const div = document.createElement('div');
        div.classList.add('overlay-button-div');
        return div;
    },

    createProjectButton(projectName) {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('overlay-button', 'project-button');

        const hashtag = document.createElement('img');
        hashtag.src = hashtagSymbol;
        hashtag.alt = 'Hashtag icon';

        button.append(hashtag, projectName);
        return button;
    },

    createEllipsisButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('ellipsis-button');

        const ellipsis = document.createElement('img');
        ellipsis.src = dotsSymbol;
        ellipsis.alt = 'Ellipsis icon';

        button.append(ellipsis);
        return button;
    },

    createEllipsisButtonOverlay() {
        const div = document.createElement('div');
        div.classList.add('overlay');

        const dividerTop = document.createElement('div');
        dividerTop.classList.add('overlay-divider');

        const firstIcon = document.createElement('img');
        firstIcon.src = pencilSymbol;
        firstIcon.classList.add('menu-icon');

        const firstButton = document.createElement('button');
        firstButton.setAttribute('type', 'button');
        firstButton.setAttribute('id', 'edit-project-button');
        firstButton.classList.add('overlay-button');

        firstButton.append(firstIcon, 'Editar projeto');

        const secondIcon = document.createElement('img');
        secondIcon.src = crossSymbol;
        secondIcon.classList.add('menu-icon');

        const secondButton = document.createElement('button');
        secondButton.setAttribute('type', 'button');
        secondButton.setAttribute('id', 'delete-project-button');
        secondButton.classList.add('overlay-button');

        secondButton.append(secondIcon, 'Excluir projeto');

        const dividerBottom = document.createElement('div');
        dividerBottom.classList.add('overlay-divider');

        div.append(dividerTop, firstButton, secondButton, dividerBottom);
        return div;
    },

    createHistoryButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button');

        const icon = document.createElement('img');
        icon.src = historySymbol;
        icon.alt = 'History icon';
        icon.classList.add('menu-icon');

        button.append(icon, 'Histórico');

        return button;
    },

    createMenuScroll() {
        const div = document.createElement('div');
        div.classList.add('menu-scroll');
        return div;
    }
}

export { menuCreator };