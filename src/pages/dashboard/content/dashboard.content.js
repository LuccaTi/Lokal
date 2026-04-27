import "./dashboard.content.css";
import sidebarIcon from "../assets/icons/menu/sidebar-right-svgrepo-com.svg";

const contentCreator = {

    createContent(user) {
        const content = document.createElement('div');
        content.classList.add('content');
        return content;
    },

    createSideButton() {
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.classList.add('menu-button', 'side', 'content');

        const icon = document.createElement('img');
        icon.src = sidebarIcon;
        icon.classList.add('menu-icon');

        button.append(icon);
        return button;
    }
};

export { contentCreator };

