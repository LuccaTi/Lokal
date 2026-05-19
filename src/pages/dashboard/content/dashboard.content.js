import "./dashboard.content.css";
import sidebarIcon from "../assets/icons/shared/sidebar-right-svgrepo-com.svg";
import lokalImage from "../assets/images/content/record-svgrepo-com.svg";
import plusIcon from "../assets/icons/shared/plus-svgrepo-com.svg";
import todayIcon from "../assets/icons/shared/today-outline-svgrepo-com.svg";
import mailBoxIcon from "../assets/icons/content/mail-box-svgrepo-com.svg";
import arrowDownIcon from "../assets/icons/shared/arrow-down-svgrepo-com.svg";
import hashtagSymbol from "../assets/icons/shared/hashtag-svgrepo-com.svg";


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

export function createTodayViewNoTasks() {
    const view = document.createElement('div');
    view.classList.add('content-today');

    const title = createContentTitle('Hoje');

    const p1 = 'Bem vindo(a) à sua visualização Hoje';
    const p2 = 'Veja tudo com vencimento hoje em todos os seus projetos';
    const wrapper = createContentWrapper(lokalImage, 'Lokal logo', p1, p2);

    view.append(title, wrapper);
    return view;
}

export function createTodayViewNoTasksAddTaskButton() {
    const button = createContentWrapperButton(plusIcon, 'Plus icon', 'Adicionar tarefa');
    return button;
}

export function createTodayViewWithTasks(user) {
    // TODO
}

export function createOverlayContent() {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-content');
    return overlay;
}

function createOverlayDivider() {
    const divider = document.createElement('div');
    divider.classList.add('overlay-divider-content');
    return divider;
}

// #region AddTaskForm
export function createAddTaskForm() {
    const form = document.createElement('form');
    form.classList.add('overlay-content');

    const titleInput = document.createElement('input');
    titleInput.classList.add('overlay-input-title');
    titleInput.setAttribute('placeholder', 'Título da tarefa');

    const descriptionInput = document.createElement('input');
    descriptionInput.classList.add('overlay-input-description');
    descriptionInput.setAttribute('placeholder', 'Descrição');

    const dateButton = document.createElement('button');
    dateButton.classList.add('overlay-button-content', 'date');
    dateButton.setAttribute('type', 'button');

    const dateButtonIcon = document.createElement('img');
    dateButtonIcon.classList.add('overlay-button-content-icon');
    dateButtonIcon.src = todayIcon;
    dateButton.alt = 'Calendar icon';

    dateButton.append(dateButtonIcon, 'Hoje');

    const divider = createOverlayDivider();

    const div = document.createElement('div');
    div.classList.add('overlay-button-content-div');

    const selectProjectButton = createSelectProjectButton();

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Cancelar';

    const addTaskButton = document.createElement('button');
    addTaskButton.classList.add('overlay-button-content', 'add');
    addTaskButton.setAttribute('type', 'submit');
    addTaskButton.textContent = 'Adicionar tarefa';

    div.append(selectProjectButton, cancelButton, addTaskButton);

    form.append(titleInput, descriptionInput, dateButton, divider, div);

    const formComponents = {
        element: form,
        titleInput: titleInput,
        descriptionInput: descriptionInput,
        dateButton: dateButton,
        selectProjectButton: selectProjectButton,
        cancelButton: cancelButton,
        addTaskButton: addTaskButton
    }

    formComponents.resetForm = () => {
        form.reset();
        
        selectProjectButton.updateSelection(null);
        
        const dateIcon = dateButton.querySelector('img');
        dateButton.replaceChildren(dateIcon, 'Hoje');

        addTaskButton.classList.add('add-task-button-restrict');
    };

    return formComponents;
}

export function createDateButtonOverlay(onDateSelected) {
    const overlay = document.createElement('div');
    overlay.classList.add('calendar-overlay');

    // Variáveis de estado do calendário
    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];

    // Header do mês/ano
    const header = document.createElement('div');
    header.classList.add('calendar-header');

    const monthYearDisplay = document.createElement('span');

    const navDiv = document.createElement('div');
    navDiv.classList.add('calendar-nav');

    const prevBtn = document.createElement('button');
    prevBtn.classList.add('calendar-nav-btn');
    prevBtn.innerHTML = '&#8249;'; // Símbolo <
    prevBtn.setAttribute('type', 'button');

    const nextBtn = document.createElement('button');
    nextBtn.classList.add('calendar-nav-btn');
    nextBtn.innerHTML = '&#8250;'; // Símbolo >
    nextBtn.setAttribute('type', 'button');

    navDiv.append(prevBtn, nextBtn);
    header.append(monthYearDisplay, navDiv);

    // Div onde ficarão as letras dos dias e os números
    const gridContainer = document.createElement('div');
    gridContainer.classList.add('calendar-grid');

    function renderCalendar(month, year) {
        gridContainer.innerHTML = ''; // Limpa o grid a cada mudança de mês
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        // 1. Gera o nome dos dias da semana (D, S, T...)
        dayNames.forEach(day => {
            const dayNameCell = document.createElement('div');
            dayNameCell.classList.add('calendar-day-name');
            dayNameCell.textContent = day;
            gridContainer.append(dayNameCell);
        });

        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 2. Preenche os espaços vazios do início do mês
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty');
            gridContainer.append(emptyCell);
        }

        // 3. Preenche os dias reais
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');

            if (
                year < today.getFullYear() ||
                (year === today.getFullYear() && month < today.getMonth()) ||
                (year === today.getFullYear() && month === today.getMonth() && day < today.getDate())
            ) {
                dayCell.classList.add('calendar-cell', 'past-day');
            } else {
                dayCell.classList.add('calendar-cell', 'day');
            }

            dayCell.textContent = day;

            // Destaca o dia de hoje
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('today-highlight');
            }

            // O disparo do clique -> devolve a data selecionada pra quem chamou o calendário
            dayCell.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedDate = new Date(year, month, day);

                // Inversão de controle que permite que o calendário seja reutilizável e não dependa de detalhes específicos de implementação de quem o chamou.
                onDateSelected(selectedDate);
            });

            gridContainer.append(dayCell);
        }
    }

    // Lógica para retroceder e avançar o mês
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
    });

    renderCalendar(currentMonth, currentYear);

    // Método customizado anexado ao elemento HTML para resetar o calendário
    overlay.resetCalendar = () => {
        today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        renderCalendar(currentMonth, currentYear);
    };

    overlay.append(header, gridContainer);
    return overlay;
}

function createSelectProjectButton() {
    const selectProjectButton = document.createElement('button');
    selectProjectButton.classList.add('overlay-button-content');
    selectProjectButton.setAttribute('type', 'button');

    const selectProjectButtonFirstIcon = document.createElement('img');
    selectProjectButtonFirstIcon.classList.add('overlay-button-content-icon');
    selectProjectButtonFirstIcon.src = mailBoxIcon;
    selectProjectButtonFirstIcon.alt = 'Mailbox icon';

    const selectProjectButtonSecondIcon = document.createElement('img');
    selectProjectButtonSecondIcon.classList.add('overlay-button-content-icon');
    selectProjectButtonSecondIcon.src = arrowDownIcon;
    selectProjectButtonSecondIcon.alt = 'Arrow down icon';

    selectProjectButton.append(selectProjectButtonFirstIcon, ' Entrada ', selectProjectButtonSecondIcon);

    // Método customizado para o botão recriar a si mesmo sem perder a referência das imagens importadas
    selectProjectButton.updateSelection = (project) => {
        if (project === null) {
            selectProjectButtonFirstIcon.src = mailBoxIcon;
            selectProjectButton.replaceChildren(selectProjectButtonFirstIcon, ' Entrada ', selectProjectButtonSecondIcon);
        } else {
            selectProjectButtonFirstIcon.src = hashtagSymbol;
            selectProjectButton.replaceChildren(selectProjectButtonFirstIcon, ` ${project.projectName} `, selectProjectButtonSecondIcon);
        }
    };

    return selectProjectButton;
}

export function createSelectProjectButtonOverlay(onProjectSelected, userProjects) {
    const overlay = document.createElement('div')
    overlay.classList.add('overlay-content', 'select-project-overlay');

    const searchProjectInput = document.createElement('input');
    searchProjectInput.classList.add('input-search-project');
    searchProjectInput.setAttribute('placeholder', 'Digite o nome de um projeto');

    const divider = createOverlayDivider();

    const entryButton = document.createElement('button');
    entryButton.classList.add('overlay-button-content', 'select-project');
    entryButton.setAttribute('type', 'button');

    const entryButtonFirstIcon = document.createElement('img');
    entryButtonFirstIcon.classList.add('overlay-button-content-icon', 'select-project');
    entryButtonFirstIcon.src = mailBoxIcon;
    entryButtonFirstIcon.alt = 'Mailbox icon';

    entryButton.append(entryButtonFirstIcon, 'Entrada');
    entryButton.addEventListener('click', () => {
        onProjectSelected(null); // Sem projeto, "Entrada" é representado por null
    });

    const myProjectsHeader = document.createElement('h2');
    myProjectsHeader.classList.add('overlay-select-project-header');
    myProjectsHeader.textContent = 'Meus projetos';

    overlay.append(searchProjectInput, divider, entryButton, myProjectsHeader);

    const projectButtonsElements = [];

    const projectsList = document.createElement('div');
    projectsList.classList.add('overlay-projects-list');

    userProjects.forEach(project => {
        const projectButton = document.createElement('button');
        projectButton.classList.add('overlay-button-content', 'select-project');
        projectButton.setAttribute('type', 'button');

        const projectButtonFirstIcon = document.createElement('img');
        projectButtonFirstIcon.classList.add('overlay-button-content-icon', 'select-project');
        projectButtonFirstIcon.src = hashtagSymbol;
        projectButtonFirstIcon.alt = 'Hashtag icon';

        projectButton.append(projectButtonFirstIcon, project.projectName);

        projectButton.addEventListener('click', () => {
            onProjectSelected(project);
        });

        projectsList.append(projectButton);

        projectButtonsElements.push({
            htmlElement: projectButton,
            projectNameText: project.projectName.toLowerCase(),
        })
    });

    overlay.append(projectsList);

    searchProjectInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        projectButtonsElements.forEach(item => {
            if (item.projectNameText.includes(searchTerm)) {
                item.htmlElement.style.display = '';
            } else {
                item.htmlElement.style.display = 'none';
            }
        });
    });

    return overlay;
}

// #endregion

// #region Funções auxiliares para criar elementos do conteúdo

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
// #endregion




