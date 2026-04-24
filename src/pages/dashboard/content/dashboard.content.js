import "./dashboard.content.css";
import sidebarIcon from "../assets/icons/menu/sidebar-right-svgrepo-com.svg";

const contentCreator = {

    createContent(user) {
        const content = document.createElement('div');
        content.classList.add('content');
        return content;
    },

    createSideButton() {
        const sideButton = document.createElement('button');
        sideButton.setAttribute('type', 'button');
        sideButton.classList.add('menu-button');

        const sideIcon = document.createElement('img');
        sideIcon.src = sidebarIcon;
        sideIcon.classList.add('menu-icon');

        sideButton.append(sideIcon);
        return sideButton;
    }
};

export { contentCreator };

