import "./dashboard.content.css";
import sidebarIcon from "../assets/icons/shared/sidebar-right-svgrepo-com.svg";
import lokalImage from "../assets/images/content/record-svgrepo-com.svg";
import plusIcon from "../assets/icons/shared/plus-svgrepo-com.svg";
import todayIcon from "../assets/icons/shared/today-outline-svgrepo-com.svg";
import mailBoxIcon from "../assets/icons/content/mail-box-svgrepo-com.svg";
import arrowDownIcon from "../assets/icons/shared/arrow-down-svgrepo-com.svg";


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

    form.append(titleInput, descriptionInput);
    return form;
}

export function createDateButton() {
    const dateButton = document.createElement('button');
    dateButton.classList.add('overlay-button-content', 'date');
    dateButton.setAttribute('type', 'button');

    const dateButtonIcon = document.createElement('img');
    dateButtonIcon.classList.add('overlay-button-content-icon');
    dateButtonIcon.src = todayIcon;
    dateButton.alt = 'Calendar icon';

    dateButton.append(dateButtonIcon, 'Hoje');
    return dateButton;
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

export function createOverlayDivider() {
    const divider = document.createElement('div');
    divider.classList.add('overlay-divider-content');
    return divider;
}

export function createFormBottomButtonsDiv() {
    const div = document.createElement('div');
    div.classList.add('overlay-button-content-div');
    return div;
}

export function createSelectProjectButton() {
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

    selectProjectButton.append(selectProjectButtonFirstIcon, 'Entrada', selectProjectButtonSecondIcon);
    return selectProjectButton;
}

export function createCancelButton() {
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Cancelar';
    return cancelButton;
}

export function createOverlayAddTaskButton() {
    const addTaskButton = document.createElement('button');
    addTaskButton.classList.add('overlay-button-content', 'add');
    addTaskButton.setAttribute('type', 'submit');
    addTaskButton.textContent = 'Adicionar tarefa';
    return addTaskButton;
}

export function createOverlayContent() {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-content');
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




