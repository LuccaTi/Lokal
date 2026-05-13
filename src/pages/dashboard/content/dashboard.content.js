import "./dashboard.content.css";
import sidebarIcon from "../assets/icons/content/sidebar-right-svgrepo-com.svg";
import lokalImage from "../assets/images/content/record-svgrepo-com.svg";
import plusIcon from "../assets/icons/content/plus-svgrepo-com.svg";


export function createContent(user) {
    const content = document.createElement('div');
    content.classList.add('content');
    return content;
}

export function createSideButton() {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('menu-button', 'side', 'content');

    const icon = document.createElement('img');
    icon.src = sidebarIcon;
    icon.classList.add('menu-icon');

    button.append(icon);
    return button;
}

export function createTodayView() {
    const view = document.createElement('div');
    view.classList.add('content-today');

    const title = createContentTitle('Hoje');

    const p1 = 'Bem vindo(a) à sua visualização Hoje';
    const p2 = 'Veja tudo com vencimento hoje em todos os seus projetos';
    const wrapper = createContentWrapper(lokalImage, 'Lokal logo', p1, p2);

    const button = createContentWrapperButton(plusIcon, 'Plus icon', 'Adicionar tarefa');

    view.append(title, wrapper, button);
    return view;
}

function createContentTitle(titleTextContent) {
    const title = document.createElement('h1');
    title.classList.add('content-title');
    title.textContent = titleTextContent;
    return title;
}

function createContentWrapper(importedImage, importedImageAlt, p1TextContent, p2TextContent) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('content-wrapper');

    const img = document.createElement('img');
    img.src = importedImage;
    img.alt = importedImageAlt;

    const p1 = document.createElement('p');
    p1.classList.add('content-wrapper-p-bold');
    p1.textContent = p1TextContent;

    const p2 = document.createElement('p');
    p2.textContent = p2TextContent;

    wrapper.append(img, p1, p2);

    return wrapper;
}

function createContentWrapperButton(importedIcon, importedIconAlt, buttonTextContent) {
    const icon = document.createElement('img');
    icon.classList.add('content-wrapper-button-img');
    icon.src = importedIcon;
    icon.alt = importedIconAlt;

    const button = document.createElement('button');
    button.classList.add('content-wrapper-button');
    button.setAttribute('type', 'button');

    button.append(icon, buttonTextContent);

    return button;
}



