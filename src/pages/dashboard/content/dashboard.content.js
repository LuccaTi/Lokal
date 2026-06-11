import "./dashboard.content.css";
import sidebarIcon from "../assets/icons/shared/sidebar-right-svgrepo-com.svg";
import lokalImage from "../assets/images/content/record-svgrepo-com.svg";
import plusIcon from "../assets/icons/shared/plus-svgrepo-com.svg";
import todayIcon from "../assets/icons/shared/today-outline-svgrepo-com.svg";
import mailBoxIcon from "../assets/icons/content/mail-box-svgrepo-com.svg";
import arrowDownIcon from "../assets/icons/shared/arrow-down-svgrepo-com.svg";
import hashtagSymbol from "../assets/icons/shared/hashtag-svgrepo-com.svg";
import crossSymbol from "../assets/icons/shared/cross-svgrepo-com.svg";
import pencilSymbol from "../assets/icons/shared/pencil-svgrepo-com.svg";
import { formatDateForButton } from "../../../shared/utils/dateUtils.js";
import overdueSymbol from "../assets/icons/content/calendar-overdue-svgrepo-com.svg";
import calendarSymbol from "../assets/icons/content/calendar-lines-pen-svgrepo-com.svg";
import calendarCheckSymbol from "../assets/icons/content/calendar-check-svgrepo-com.svg";
import arrowLeftIcon from "../assets/icons/content/arrow-left-svgrepo-com.svg";
import arrowRightIcon from "../assets/icons/content/arrow-right-svgrepo-com.svg";


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

// #region Today view
export function createTodayViewNoTasksAddTaskButton() {
    const button = createContentWrapperButton(plusIcon, 'Plus icon', 'Adicionar tarefa');
    return button;
}

export function createTodayViewWithTasks(tasksWithoutProjects, tasksFromProjects) {
    const viewContainer = document.createElement('div');
    viewContainer.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle('Hoje');

    const taskCountHeader = document.createElement('h2');
    taskCountHeader.classList.add('content-count-header');
    const taskCount = tasksWithoutProjects.length + tasksFromProjects.length
    taskCountHeader.textContent = `${taskCount} tarefa(s) para hoje`;

    headerContainer.append(title, taskCountHeader);

    viewContainer.append(headerContainer);

    const allTasksViewsWithoutProjects = tasksWithoutProjects
        .map(task => {
            const taskView = createTaskViewWithCheckbox(task, null);
            // Sem projeto, então passa null

            taskView.dueDate = new Date(task.dueDate);
            taskView.createdAt = Number(task.createdAt);
            taskView.fromProject = false;
            taskView.taskId = task.id;

            return taskView;
        });

    const allTasksViewsFromProjects = tasksFromProjects
        .map(task => {
            const taskView = createTaskViewWithCheckbox(task, task.projectTitle);
            // Com projeto, passamos o título dele.

            taskView.dueDate = new Date(task.dueDate);
            taskView.createdAt = Number(task.createdAt);
            taskView.fromProject = true;
            taskView.taskId = task.id;

            return taskView;
        })

    const allTasksViews = [...allTasksViewsWithoutProjects, ...allTasksViewsFromProjects]
        .sort((a, b) => {
            const dayA = a.dueDate.toLocaleDateString('pt-BR');
            const dayB = b.dueDate.toLocaleDateString('pt-BR');

            if (dayA === dayB) {
                return a.createdAt - b.createdAt;
            }

            return a.dueDate - b.dueDate;
        });

    const tasksContainer = document.createElement('div');
    tasksContainer.classList.add('tasks-container');

    allTasksViews.forEach(taskView => {
        tasksContainer.append(taskView.element);
    });

    viewContainer.append(tasksContainer);

    const addTaskButton = document.createElement('button');
    addTaskButton.classList.add('content-add-button');
    addTaskButton.setAttribute('type', 'button');

    const addButtonIcon = document.createElement('img');
    addButtonIcon.src = plusIcon;
    addButtonIcon.alt = 'Plus icon';
    addButtonIcon.classList.add('content-add-button-icon');
    addTaskButton.append(addButtonIcon, 'Adicionar tarefa');

    viewContainer.append(addTaskButton);

    return {
        element: viewContainer,
        allTasksViews: allTasksViews,
        addTaskButton: addTaskButton
    }
}
// #endregion

// #region AddTaskForm
export function createAddTaskForm() {
    const form = document.createElement('form');
    form.classList.add('overlay-content');
    form.setAttribute('data-js', 'add-task-form');

    const titleInput = document.createElement('input');
    titleInput.classList.add('overlay-input-title');
    titleInput.setAttribute('placeholder', 'Título da tarefa');
    titleInput.setAttribute('maxlength', '50');

    const titleSizeWarning = document.createElement('p');
    titleSizeWarning.classList.add('text-size-warning');
    titleSizeWarning.textContent = 'Max: 50 caracteres';

    const titleDivider = createOverlayDivider();

    const descriptionInput = document.createElement('input');
    descriptionInput.classList.add('overlay-input-description');
    descriptionInput.setAttribute('placeholder', 'Descrição');
    descriptionInput.setAttribute('maxlength', '100');

    const descriptionSizeWarning = document.createElement('p');
    descriptionSizeWarning.classList.add('text-size-warning');
    descriptionSizeWarning.textContent = 'Max: 100 caracteres';

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

    div.append(cancelButton, addTaskButton);

    form.append(titleInput, titleSizeWarning, titleDivider, descriptionInput, descriptionSizeWarning, dateButton, divider, selectProjectButton, div);

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

    const buttonText = document.createElement('span');
    buttonText.classList.add('overlay-button-content-text', 'select-project');
    buttonText.textContent = ' Entrada ';

    selectProjectButton.append(selectProjectButtonFirstIcon, buttonText, selectProjectButtonSecondIcon);

    // Método customizado para o botão recriar a si mesmo sem perder a referência das imagens importadas
    selectProjectButton.updateSelection = (project) => {
        if (project === null) {
            selectProjectButtonFirstIcon.src = mailBoxIcon;
            buttonText.textContent = ' Entrada ';
            selectProjectButton.replaceChildren(selectProjectButtonFirstIcon, buttonText, selectProjectButtonSecondIcon);
        } else {
            selectProjectButtonFirstIcon.src = hashtagSymbol;
            buttonText.textContent = ` ${project.title} `;
            selectProjectButton.replaceChildren(selectProjectButtonFirstIcon, buttonText, selectProjectButtonSecondIcon);
        }
    };

    return selectProjectButton;
}

export function createSelectProjectButtonOverlay(onProjectSelected, userIncompleteProjects) {
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

    userIncompleteProjects.forEach(project => {
        const projectButton = document.createElement('button');
        projectButton.classList.add('overlay-button-content', 'select-project');
        projectButton.setAttribute('type', 'button');

        const projectButtonFirstIcon = document.createElement('img');
        projectButtonFirstIcon.classList.add('overlay-button-content-icon', 'select-project');
        projectButtonFirstIcon.src = hashtagSymbol;
        projectButtonFirstIcon.alt = 'Hashtag icon';

        const buttonText = document.createElement('span');
        buttonText.classList.add('overlay-button-content-text', 'select-project');
        buttonText.append(project.title);

        projectButton.append(projectButtonFirstIcon, buttonText);

        projectButton.addEventListener('click', () => {
            onProjectSelected(project);
        });

        projectsList.append(projectButton);

        projectButtonsElements.push({
            htmlElement: projectButton,
            projectTitleText: project.title.toLowerCase(),
        })
    });

    overlay.append(projectsList);

    searchProjectInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        projectButtonsElements.forEach(item => {
            if (item.projectTitleText.includes(searchTerm)) {
                item.htmlElement.style.display = '';
            } else {
                item.htmlElement.style.display = 'none';
            }
        });
    });

    return overlay;
}
// #endregion

// #region Shortly view
export function createShortlyViewWithTasks(tasksWithoutProjects, tasksFromProjects) {
    const viewContainer = document.createElement('div');
    viewContainer.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle('Em breve');

    const taskCountHeader = document.createElement('h2');
    taskCountHeader.classList.add('content-count-header');
    const taskCount = tasksWithoutProjects.length + tasksFromProjects.length
    taskCountHeader.textContent = `${taskCount} tarefa(s) posteriores`;

    headerContainer.append(title, taskCountHeader);

    viewContainer.append(headerContainer);

    const allTasksViewsWithoutProjects = tasksWithoutProjects
        .map(task => {
            const taskView = createTaskViewWithCheckbox(task, null);
            // Sem projeto, então passa null

            taskView.dueDate = new Date(task.dueDate);
            taskView.createdAt = Number(task.createdAt);
            taskView.fromProject = false;
            taskView.taskId = task.id;

            return taskView;
        })

    const allTasksViewsFromProjects = tasksFromProjects
        .map(task => {
            const taskView = createTaskViewWithCheckbox(task, task.projectTitle);
            // Com projeto, passamos o título dele.

            taskView.dueDate = new Date(task.dueDate);
            taskView.createdAt = Number(task.createdAt);
            taskView.fromProject = true;
            taskView.taskId = task.id;

            return taskView;
        })

    const allTasksViews = [...allTasksViewsWithoutProjects, ...allTasksViewsFromProjects]
        .sort((a, b) => {
            const dayA = a.dueDate.toLocaleDateString('pt-BR');
            const dayB = b.dueDate.toLocaleDateString('pt-BR');

            if (dayA === dayB) {
                return a.createdAt - b.createdAt;
            }

            return a.dueDate - b.dueDate;
        });

    const tasksContainer = document.createElement('div');
    tasksContainer.classList.add('tasks-container');

    allTasksViews.forEach(taskView => {
        tasksContainer.append(taskView.element);
    });

    viewContainer.append(tasksContainer);

    return {
        element: viewContainer,
        allTasksViews: allTasksViews,
    }
}

// #endregion

// #region History view
export function createHistoryViewWithTasks(tasksForMonth, monthLabel, disableLeft, disableRight) {
    const viewContainer = document.createElement('div');
    viewContainer.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle('Histórico');

    const taskCountHeader = document.createElement('h2');
    taskCountHeader.classList.add('content-count-header');
    taskCountHeader.textContent = `${tasksForMonth.length} tarefa(s) concluída(s)`;

    const monthHeaderDiv = document.createElement('div');
    monthHeaderDiv.classList.add('history-month-header-div');

    const leftArrowButton = document.createElement('button');
    leftArrowButton.classList.add('history-nav-button');
    leftArrowButton.setAttribute('type', 'button');
    if (disableLeft) leftArrowButton.classList.add('history-nav-disabled');

    const leftArrowIcon = document.createElement('img');
    leftArrowIcon.classList.add('history-nav-icon');
    leftArrowIcon.src = arrowLeftIcon;
    leftArrowIcon.alt = 'Left arrow icon';
    leftArrowButton.append(leftArrowIcon);

    const rightArrowButton = document.createElement('button');
    rightArrowButton.classList.add('history-nav-button');
    rightArrowButton.setAttribute('type', 'button');
    if (disableRight) rightArrowButton.classList.add('history-nav-disabled');

    const rightArrowIcon = document.createElement('img');
    rightArrowIcon.classList.add('history-nav-icon');
    rightArrowIcon.src = arrowRightIcon;
    rightArrowIcon.alt = 'Right arrow icon';
    rightArrowButton.append(rightArrowIcon);

    const monthNavDiv = document.createElement('div');
    monthNavDiv.classList.add('history-month-nav');

    const monthHeader = document.createElement('h3');
    monthHeader.classList.add('history-month-header');
    monthHeader.textContent = monthLabel;
    monthNavDiv.append(monthHeader);

    monthHeaderDiv.append(leftArrowButton, monthNavDiv, rightArrowButton);

    headerContainer.append(title, taskCountHeader, monthHeaderDiv);
    viewContainer.append(headerContainer);

    const tasksContainer = document.createElement('div');
    tasksContainer.classList.add('tasks-container');

    const completedTasksViews = [];

    tasksForMonth.forEach(task => {
        const taskElement = createCompletedTaskView(task, null); // Sem projeto, então passa null
        completedTasksViews.push(taskElement);
        tasksContainer.append(taskElement.element);
    });

    viewContainer.append(tasksContainer);

    return {
        element: viewContainer,
        completedTasksViews: completedTasksViews,
        leftArrowButton: leftArrowButton,
        rightArrowButton: rightArrowButton
    };
}

export function createHistoryViewWithItems(itemsForMonth, monthLabel, disableLeft, disableRight) {
    const viewContainer = document.createElement('div');
    viewContainer.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle('Histórico');

    const itemCountHeader = document.createElement('h2');
    itemCountHeader.classList.add('content-count-header');
    itemCountHeader.textContent = `${itemsForMonth.length} item(s) concluido(s)`;

    const monthHeaderDiv = document.createElement('div');
    monthHeaderDiv.classList.add('history-month-header-div');

    const leftArrowButton = document.createElement('button');
    leftArrowButton.classList.add('history-nav-button');
    leftArrowButton.setAttribute('type', 'button');
    if (disableLeft) leftArrowButton.classList.add('history-nav-disabled');

    const leftArrowIcon = document.createElement('img');
    leftArrowIcon.classList.add('history-nav-icon');
    leftArrowIcon.src = arrowLeftIcon;
    leftArrowIcon.alt = 'Left arrow icon';
    leftArrowButton.append(leftArrowIcon);

    const rightArrowButton = document.createElement('button');
    rightArrowButton.classList.add('history-nav-button');
    rightArrowButton.setAttribute('type', 'button');
    if (disableRight) rightArrowButton.classList.add('history-nav-disabled');

    const rightArrowIcon = document.createElement('img');
    rightArrowIcon.classList.add('history-nav-icon');
    rightArrowIcon.src = arrowRightIcon;
    rightArrowIcon.alt = 'Right arrow icon';
    rightArrowButton.append(rightArrowIcon);

    const monthNavDiv = document.createElement('div');
    monthNavDiv.classList.add('history-month-nav');

    const monthHeader = document.createElement('h3');
    monthHeader.classList.add('history-month-header');
    monthHeader.textContent = monthLabel;
    monthNavDiv.append(monthHeader);

    monthHeaderDiv.append(leftArrowButton, monthNavDiv, rightArrowButton);

    headerContainer.append(title, itemCountHeader, monthHeaderDiv);
    viewContainer.append(headerContainer);

    const itemsContainer = document.createElement('div');
    itemsContainer.classList.add('tasks-projects-container');

    const completedItemViews = [];

    itemsForMonth.forEach(item => {
        if (item.type === 'task') {
            const taskView = createCompletedTaskView(item.task, null);
            itemsContainer.append(taskView.element);
            completedItemViews.push({
                type: 'task',
                taskId: item.task.id,
                view: taskView
            });
        }

        if (item.type === 'project') {
            const projectView = createCompletedProjectCard(item.project);
            itemsContainer.append(projectView.element);
            completedItemViews.push({
                type: 'project',
                projectId: item.project.id,
                view: projectView
            });
        }
    });

    viewContainer.append(itemsContainer);

    return {
        element: viewContainer,
        completedItemViews: completedItemViews,
        leftArrowButton: leftArrowButton,
        rightArrowButton: rightArrowButton
    };
}

// #endregion

// #region Task view 
function createTaskViewWithCheckbox(task, projectTitle) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-div');

    const checkboxDiv = document.createElement('div');
    checkboxDiv.classList.add('checkbox-task-div');

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.classList.add('checkbox-task');

    checkboxDiv.append(checkbox);

    const taskInfoDiv = document.createElement('div');
    taskInfoDiv.classList.add('task-div-info');

    const titleAndDeleteButtonDiv = document.createElement('div');
    titleAndDeleteButtonDiv.classList.add('task-div-title-delete');

    const taskTitle = document.createElement('h3');
    taskTitle.classList.add('task-div-title');
    taskTitle.textContent = task.title;

    const editButton = document.createElement('button');
    editButton.classList.add('task-div-button');
    editButton.setAttribute('type', 'button');

    const editButtonIcon = document.createElement('img');
    editButtonIcon.src = pencilSymbol;
    editButtonIcon.classList.add('task-div-icon');
    editButtonIcon.alt = 'Pencil icon';
    editButton.append(editButtonIcon);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('task-div-button');
    deleteButton.setAttribute('type', 'button');

    const deleteButtonIcon = document.createElement('img');
    deleteButtonIcon.src = crossSymbol;
    deleteButtonIcon.classList.add('task-div-icon');
    deleteButtonIcon.alt = 'Cross icon';
    deleteButton.append(deleteButtonIcon);

    const editDeleteDiv = document.createElement('div');
    editDeleteDiv.classList.add('task-div-edit-delete');
    editDeleteDiv.append(editButton, deleteButton);

    titleAndDeleteButtonDiv.append(taskTitle, editDeleteDiv);

    const taskDescription = document.createElement('p');
    taskDescription.classList.add('task-div-description');
    taskDescription.textContent = task.description;

    taskInfoDiv.append(titleAndDeleteButtonDiv, taskDescription);

    const projectInfoDiv = document.createElement('div');
    projectInfoDiv.classList.add('task-div-project');

    const projectName = document.createElement('p');
    projectName.classList.add('task-div-project-name');

    const projectIcon = document.createElement('img');
    projectIcon.classList.add('task-div-icon');

    const projectIconNameDiv = document.createElement('div');
    projectIconNameDiv.classList.add('project-name-icon-div');
    projectIconNameDiv.append(projectIcon, projectName);

    const dueDateWarning = document.createElement('p');
    dueDateWarning.classList.add('task-div-due-date-warning');

    const formatedDate = new Date(task.dueDate).toLocaleDateString('pt-br');
    dueDateWarning.textContent = `Fazer até: ${formatedDate}`;

    let taskViewProjectTitle = '';

    if (projectTitle === null) {
        projectName.textContent = 'Entrada';
        projectIcon.src = mailBoxIcon;
        projectIcon.alt = 'Mailbox icon';
        taskViewProjectTitle = '';
    } else {
        projectName.textContent = projectTitle;
        projectIcon.src = hashtagSymbol;
        projectIcon.alt = 'Hashtag icon';
        taskViewProjectTitle = projectTitle;
    }

    projectInfoDiv.append(projectIconNameDiv, dueDateWarning);

    const bottomDivider = createOverlayDivider();
    bottomDivider.classList.add('task-div-divider');

    taskDiv.append(checkboxDiv, taskInfoDiv, projectInfoDiv, bottomDivider);

    return {
        element: taskDiv,
        taskTitle: taskTitle,
        taskDescription: taskDescription,
        checkbox: checkbox,
        editButton: editButton,
        deleteButton: deleteButton,
        taskViewProjectTitle: taskViewProjectTitle
    };
}

function createTaskViewWithoutCheckbox(task, project) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-div');

    const taskInfoDiv = document.createElement('div');
    taskInfoDiv.classList.add('task-div-info', 'no-checkbox');

    const titleAndDeleteButtonDiv = document.createElement('div');
    titleAndDeleteButtonDiv.classList.add('task-div-title-delete');

    const taskTitle = document.createElement('h3');
    taskTitle.classList.add('task-div-title');
    taskTitle.textContent = task.title;

    const editButton = document.createElement('button');
    editButton.classList.add('task-div-button');
    editButton.setAttribute('type', 'button');

    const editButtonIcon = document.createElement('img');
    editButtonIcon.src = pencilSymbol;
    editButtonIcon.classList.add('task-div-icon');
    editButtonIcon.alt = 'Pencil icon';
    editButton.append(editButtonIcon);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('task-div-button');
    deleteButton.setAttribute('type', 'button');

    const deleteButtonIcon = document.createElement('img');
    deleteButtonIcon.src = crossSymbol;
    deleteButtonIcon.classList.add('task-div-icon');
    deleteButtonIcon.alt = 'Cross icon';
    deleteButton.append(deleteButtonIcon);

    const editDeleteDiv = document.createElement('div');
    editDeleteDiv.classList.add('task-div-edit-delete');
    editDeleteDiv.append(editButton, deleteButton);

    titleAndDeleteButtonDiv.append(taskTitle, editDeleteDiv);

    const taskDescription = document.createElement('p');
    taskDescription.classList.add('task-div-description');
    taskDescription.textContent = task.description;

    taskInfoDiv.append(titleAndDeleteButtonDiv, taskDescription);

    const projectInfoDiv = document.createElement('div');
    projectInfoDiv.classList.add('task-div-project', 'shortly');

    const projectName = document.createElement('p');
    projectName.classList.add('task-div-project-name');

    const projectIcon = document.createElement('img');
    projectIcon.classList.add('task-div-icon');

    const projectIconNameDiv = document.createElement('div');
    projectIconNameDiv.classList.add('project-name-icon-div');
    projectIconNameDiv.append(projectIcon, projectName);

    const dueDateWarning = document.createElement('p');
    dueDateWarning.classList.add('task-div-due-date-warning');

    const formatedDate = new Date(task.dueDate).toLocaleDateString('pt-br');
    dueDateWarning.textContent = `Fazer até: ${formatedDate}`;

    if (project === null) {
        projectName.textContent = 'Entrada';
        projectIcon.src = mailBoxIcon;
        projectIcon.alt = 'Mailbox icon';
    } else {
        projectName.textContent = project.title;
        projectIcon.src = hashtagSymbol;
        projectIcon.alt = 'Hashtag icon';
    }

    projectInfoDiv.append(dueDateWarning, projectIconNameDiv);

    const bottomDivider = createOverlayDivider();
    bottomDivider.classList.add('task-div-divider');

    taskDiv.append(taskInfoDiv, projectInfoDiv, bottomDivider);

    return {
        element: taskDiv,
        taskTitle: taskTitle,
        taskDescription: taskDescription,
        editButton: editButton,
        deleteButton: deleteButton
    };
}

function createCompletedTaskView(task, project) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-div');

    const taskInfoDiv = document.createElement('div');
    taskInfoDiv.classList.add('task-div-info', 'no-checkbox');

    const titleAndDeleteButtonDiv = document.createElement('div');
    titleAndDeleteButtonDiv.classList.add('task-div-title-delete');

    const taskTitle = document.createElement('h3');
    taskTitle.classList.add('task-div-title');
    taskTitle.textContent = task.title;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('task-div-button');
    deleteButton.setAttribute('type', 'button');

    const deleteButtonIcon = document.createElement('img');
    deleteButtonIcon.src = crossSymbol;
    deleteButtonIcon.classList.add('task-div-icon');
    deleteButtonIcon.alt = 'Cross icon';
    deleteButton.append(deleteButtonIcon);

    titleAndDeleteButtonDiv.append(taskTitle, deleteButton);

    const taskDescription = document.createElement('p');
    taskDescription.classList.add('task-div-description');
    taskDescription.textContent = task.description;

    taskInfoDiv.append(titleAndDeleteButtonDiv, taskDescription);

    const projectInfoDiv = document.createElement('div');
    projectInfoDiv.classList.add('task-div-project', 'shortly');

    const projectName = document.createElement('p');
    projectName.classList.add('task-div-project-name');

    const projectIcon = document.createElement('img');
    projectIcon.classList.add('task-div-icon');

    const projectIconNameDiv = document.createElement('div');
    projectIconNameDiv.classList.add('project-name-icon-div');
    projectIconNameDiv.append(projectIcon, projectName);

    const dueDateWarning = document.createElement('p');
    dueDateWarning.classList.add('task-div-due-date-warning');

    const formatedDate = new Date(task.dueDate).toLocaleDateString('pt-br');
    dueDateWarning.textContent = `Fazer até: ${formatedDate}`;

    if (project === null) {
        projectName.textContent = 'Entrada';
        projectIcon.src = mailBoxIcon;
        projectIcon.alt = 'Mailbox icon';
    } else {
        projectName.textContent = project.title;
        projectIcon.src = hashtagSymbol;
        projectIcon.alt = 'Hashtag icon';
    }

    projectInfoDiv.append(dueDateWarning, projectIconNameDiv);

    const bottomDivider = createOverlayDivider();
    bottomDivider.classList.add('task-div-divider');

    taskDiv.append(taskInfoDiv, projectInfoDiv, bottomDivider);

    return {
        element: taskDiv,
        taskId: task.id,
        taskTitle: taskTitle,
        taskDescription: taskDescription,
        deleteButton: deleteButton
    };
}

export function createTaskCompletedWarning(daysAgoCompleted) {
    const warningDiv = document.createElement('div');
    warningDiv.classList.add('completed-warning');

    const today = new Date().setHours(0, 0, 0, 0);
    const completedDate = new Date(today - (daysAgoCompleted * 24 * 60 * 60 * 1000));

    const warningIcon = document.createElement('img');
    warningIcon.src = calendarCheckSymbol;
    warningIcon.alt = 'Calendar check icon';
    warningIcon.classList.add('task-icon');

    const warningText = document.createElement('p');
    warningText.classList.add('completed-warning-text');
    warningText.textContent = `Completa há ${daysAgoCompleted} dia(s) - Finalizada dia: ${completedDate.toLocaleDateString()}`;

    warningDiv.append(warningIcon, warningText);

    return warningDiv;
}

export function createTaskLateWarning(daysLate) {
    const warningDiv = document.createElement('div');
    warningDiv.classList.add('task-late-warning');

    const today = new Date().setHours(0, 0, 0, 0);
    const dueDate = new Date(today - (daysLate * 24 * 60 * 60 * 1000));

    const warningIcon = document.createElement('img');
    warningIcon.src = overdueSymbol;
    warningIcon.alt = 'Overdue icon';
    warningIcon.classList.add('task-icon');

    const warningText = document.createElement('p');
    warningText.classList.add('task-late-warning-text');
    warningText.textContent = `Atrasada há ${daysLate} dia(s) - Venceu dia: ${dueDate.toLocaleDateString()}`;

    warningDiv.append(warningIcon, warningText);

    return warningDiv;
}

export function createEditTaskForm(
    taskTitle,
    taskDescription,
    taskDate,
    ProjectName
) {
    const form = document.createElement('form');
    form.classList.add('overlay-content');

    const titleInput = document.createElement('input');
    titleInput.classList.add('overlay-input-title', 'edit');
    titleInput.value = taskTitle;
    titleInput.setAttribute('maxlength', '50');

    const titleSizeWarning = document.createElement('p');
    titleSizeWarning.classList.add('text-size-warning');
    titleSizeWarning.textContent = 'Max: 50 caracteres';

    const titleDivider = createOverlayDivider();

    const descriptionInput = document.createElement('input');
    descriptionInput.classList.add('overlay-input-description', 'edit');
    if (taskDescription === '' || taskDescription === null) {
        descriptionInput.setAttribute('placeholder', 'Descrição');
    } else {
        descriptionInput.value = taskDescription;
    }
    descriptionInput.setAttribute('maxlength', '100');

    const descriptionSizeWarning = document.createElement('p');
    descriptionSizeWarning.classList.add('text-size-warning');
    descriptionSizeWarning.textContent = 'Max: 100 caracteres';

    const dateButton = document.createElement('button');
    dateButton.classList.add('overlay-button-content', 'date');
    dateButton.setAttribute('type', 'button');

    const dateButtonIcon = document.createElement('img');
    dateButtonIcon.classList.add('overlay-button-content-icon');
    dateButtonIcon.src = todayIcon;
    dateButton.alt = 'Calendar icon';

    const formattedDate = formatDateForButton(taskDate);

    dateButton.append(dateButtonIcon, formattedDate);

    const divider = createOverlayDivider();

    const div = document.createElement('div');
    div.classList.add('overlay-button-content-div');

    const selectProjectButton = createSelectProjectButton();
    if (ProjectName !== null) {
        selectProjectButton.updateSelection(ProjectName);
    }

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Cancelar';

    const saveButton = document.createElement('button');
    saveButton.classList.add('overlay-button-content', 'add');
    saveButton.setAttribute('type', 'submit');
    saveButton.textContent = 'Salvar alterações';

    div.append(cancelButton, saveButton);

    form.append(titleInput, titleSizeWarning, titleDivider, descriptionInput, descriptionSizeWarning, dateButton, divider, selectProjectButton, div);

    const formComponents = {
        element: form,
        titleInput: titleInput,
        descriptionInput: descriptionInput,
        dateButton: dateButton,
        selectProjectButton: selectProjectButton,
        cancelButton: cancelButton,
        saveButton: saveButton
    }

    return formComponents;
}

export function createDeleteTaskOverlay(taskTitle) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-content', 'delete-overlay');

    const message = document.createElement('p');
    message.classList.add('overlay-message');
    message.textContent = `Tem certeza que deseja deletar a tarefa "${taskTitle}"?`;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('delete-confirmation-buttons');

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Cancelar';

    const confirmButton = document.createElement('button');
    confirmButton.classList.add('overlay-button-content', 'delete');
    confirmButton.setAttribute('type', 'button');
    confirmButton.textContent = 'Excluir';

    buttonsDiv.append(cancelButton, confirmButton);
    overlay.append(message, buttonsDiv);

    return {
        element: overlay,
        cancelButton: cancelButton,
        confirmButton: confirmButton
    }
}
// #endregion

// #region Project view
export function createProjectViewWithoutProjects() {
    const view = document.createElement('div');
    view.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle('Meus Projetos');

    headerContainer.append(title);

    const p1 = 'Parece que você ainda não tem nenhum projeto criado.';
    const p2 = 'Clique no botão abaixo para criar seu primeiro projeto e começar a organizar suas tarefas!';
    const wrapper = createContentWrapper(lokalImage, 'Lokal logo', p1, p2);


    const button = createContentWrapperButton(plusIcon, 'Plus icon', 'Adicionar projeto');

    view.append(headerContainer, wrapper, button);

    return {
        element: view,
        addProjectButton: button
    }
}

export function createAddProjectForm() {
    const form = document.createElement('form');
    form.classList.add('overlay-content', 'project-form');
    form.setAttribute('data-js', 'add-project-form');

    const titleInput = document.createElement('input');
    titleInput.classList.add('overlay-input-title');
    titleInput.setAttribute('placeholder', 'Título do projeto');
    titleInput.setAttribute('maxlength', '40');

    const divider = createOverlayDivider();

    const div = document.createElement('div');
    div.classList.add('overlay-button-content-div');

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Cancelar';

    const addProjectButton = document.createElement('button');
    addProjectButton.classList.add('overlay-button-content', 'add');
    addProjectButton.setAttribute('type', 'submit');
    addProjectButton.textContent = 'Adicionar projeto';

    div.append(cancelButton, addProjectButton);

    form.append(titleInput, divider, div);

    const formComponents = {
        element: form,
        titleInput: titleInput,
        cancelButton: cancelButton,
        addProjectButton: addProjectButton
    }

    formComponents.resetForm = () => {
        form.reset();

        addProjectButton.classList.add('add-task-button-restrict');
    };

    return formComponents;
}

export function createProjectViewWithAllProjects(userIncompleteProjects) {
    const viewContainer = document.createElement('div');
    viewContainer.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle('Meus Projetos');

    const projectCountHeader = document.createElement('h2');
    projectCountHeader.classList.add('content-count-header');
    projectCountHeader.textContent = `${userIncompleteProjects.length} projeto(s)`;

    headerContainer.append(title, projectCountHeader);

    viewContainer.append(headerContainer);

    const projectsCards = userIncompleteProjects
        .sort((a, b) => a.createdAt - b.createdAt)
        .map(project => {
            const projectCard = createProjectCard(project);

            projectCard.projectId = project.id;

            return projectCard;
        });

    const projectsContainer = document.createElement('div');
    projectsContainer.classList.add('projects-container');

    projectsCards.forEach(projectCard => {
        projectsContainer.append(projectCard.element);
    });

    viewContainer.append(projectsContainer);

    const addProjectButton = document.createElement('button');
    addProjectButton.classList.add('content-add-button');
    addProjectButton.setAttribute('type', 'button');

    const addButtonIcon = document.createElement('img');
    addButtonIcon.src = plusIcon;
    addButtonIcon.alt = 'Plus icon';
    addButtonIcon.classList.add('content-add-button-icon');
    addProjectButton.append(addButtonIcon, 'Adicionar projeto');

    viewContainer.append(addProjectButton);

    return {
        element: viewContainer,
        projectsCards: projectsCards,
        addProjectButton: addProjectButton
    }
}

export function createSoloProjectView(project) {
    const viewContainer = document.createElement('div');
    viewContainer.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle(project.title);

    const taskCountHeader = document.createElement('h2');
    taskCountHeader.classList.add('content-count-header');
    taskCountHeader.textContent = `${project.tasks.length} tarefa(s)`;

    const addTaskWarning = document.createElement('p');
    addTaskWarning.classList.add('content-header-task-warning');
    addTaskWarning.textContent = `Para adicionar uma tarefa utilize o menu lateral e selecione o projeto "${project.title}" na lista`;

    const addTaskWarningContainer = document.createElement('div');
    addTaskWarningContainer.classList.add('content-header-task-warning-container');
    addTaskWarningContainer.append(addTaskWarning);

    headerContainer.append(title, taskCountHeader, addTaskWarningContainer);

    viewContainer.append(headerContainer);

    const taskViews = project.tasks
        .sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);

            const dayA = dateA.toLocaleDateString('pt-BR');
            const dayB = dateB.toLocaleDateString('pt-BR');

            if (dayA === dayB) {
                const numberA = Number(a.createdAt);
                const numberB = Number(b.createdAt);
                return numberA - numberB;
            }

            return dateA - dateB;
        })
        .map(task => {
            const taskView = createTaskViewWithCheckbox(task, project.title);

            taskView.taskId = task.id;

            return taskView;
        });

    const tasksContainer = document.createElement('div');
    tasksContainer.classList.add('tasks-container');

    taskViews.forEach(taskView => {
        tasksContainer.append(taskView.element);
    });

    viewContainer.append(tasksContainer);

    return {
        element: viewContainer,
        taskViews: taskViews
    }
}

function createProjectCard(project) {
    const projectDiv = document.createElement('div');
    projectDiv.classList.add('project-div');

    const checkboxDiv = document.createElement('div');
    checkboxDiv.classList.add('checkbox-project-div');

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.classList.add('checkbox-project');

    checkboxDiv.append(checkbox);

    const projectInfoDiv = document.createElement('div');
    projectInfoDiv.classList.add('project-div-info');

    const titleAndDeleteButtonDiv = document.createElement('div');
    titleAndDeleteButtonDiv.classList.add('project-div-title-delete');

    const projectTitle = document.createElement('h3');
    projectTitle.classList.add('project-div-title');
    projectTitle.textContent = project.title;

    const editButton = document.createElement('button');
    editButton.classList.add('project-div-button');
    editButton.setAttribute('type', 'button');

    const editButtonIcon = document.createElement('img');
    editButtonIcon.src = pencilSymbol;
    editButtonIcon.classList.add('project-div-icon');
    editButtonIcon.alt = 'Pencil icon';
    editButton.append(editButtonIcon);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('project-div-button');
    deleteButton.setAttribute('type', 'button');

    const deleteButtonIcon = document.createElement('img');
    deleteButtonIcon.src = crossSymbol;
    deleteButtonIcon.classList.add('project-div-icon');
    deleteButtonIcon.alt = 'Cross icon';
    deleteButton.append(deleteButtonIcon);

    const editDeleteDiv = document.createElement('div');
    editDeleteDiv.classList.add('project-div-edit-delete');
    editDeleteDiv.append(editButton, deleteButton);

    titleAndDeleteButtonDiv.append(projectTitle, editDeleteDiv);

    projectInfoDiv.append(titleAndDeleteButtonDiv);

    const bottomDivider = createOverlayDivider();
    bottomDivider.classList.add('project-div-divider');

    projectDiv.append(checkboxDiv, projectInfoDiv, bottomDivider);

    return {
        element: projectDiv,
        projectTitle: projectTitle,
        checkbox: checkbox,
        editButton: editButton,
        deleteButton: deleteButton
    };
}

export function createDeleteProjectOverlay(projectTitle) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-content', 'delete-overlay');

    const message = document.createElement('p');
    message.classList.add('overlay-message');
    message.textContent = `Tem certeza que deseja deletar o projeto "${projectTitle}"?`;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('delete-confirmation-buttons');

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Cancelar';

    const confirmButton = document.createElement('button');
    confirmButton.classList.add('overlay-button-content', 'delete');
    confirmButton.setAttribute('type', 'button');
    confirmButton.textContent = 'Excluir';

    buttonsDiv.append(cancelButton, confirmButton);
    overlay.append(message, buttonsDiv);

    return {
        element: overlay,
        cancelButton: cancelButton,
        confirmButton: confirmButton
    }
}

export function createEditProjectForm(projectTitle) {
    const form = document.createElement('form');
    form.classList.add('overlay-content', 'project-form');

    const titleInput = document.createElement('input');
    titleInput.classList.add('overlay-input-title', 'edit');
    titleInput.setAttribute('placeholder', projectTitle);

    const divider = createOverlayDivider();

    const div = document.createElement('div');
    div.classList.add('overlay-button-content-div');

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Cancelar';

    const saveButton = document.createElement('button');
    saveButton.classList.add('overlay-button-content', 'add');
    saveButton.setAttribute('type', 'submit');
    saveButton.textContent = 'Salvar alterações';

    div.append(cancelButton, saveButton);

    form.append(titleInput, divider, div);

    const formComponents = {
        element: form,
        titleInput: titleInput,
        cancelButton: cancelButton,
        saveButton: saveButton
    }

    return formComponents;
}

function createCompletedProjectCard(project) {
    const projectDiv = document.createElement('div');
    projectDiv.classList.add('project-div', 'project-history-card');

    const projectInfoDiv = document.createElement('div');
    projectInfoDiv.classList.add('project-div-info', 'no-checkbox', 'project-history-info');

    const titleAndDeleteButtonDiv = document.createElement('div');
    titleAndDeleteButtonDiv.classList.add('project-div-title-delete');

    const hashTagIcon = document.createElement('img');
    hashTagIcon.classList.add('project-card-icon');
    hashTagIcon.src = hashtagSymbol;
    hashTagIcon.alt = 'Hashtag icon';

    const projectTitle = document.createElement('h3');
    projectTitle.classList.add('project-div-title');
    projectTitle.textContent = project.title;

    const iconTitleDiv = document.createElement('div');
    iconTitleDiv.classList.add('project-history-icon-title-div');
    iconTitleDiv.append(hashTagIcon, projectTitle);

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('project-history-actions');

    const toggleTasksButton = document.createElement('button');
    toggleTasksButton.classList.add('project-history-toggle');
    toggleTasksButton.setAttribute('type', 'button');
    toggleTasksButton.textContent = 'Mostrar tarefas';

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('project-div-button');
    deleteButton.setAttribute('type', 'button');

    const deleteButtonIcon = document.createElement('img');
    deleteButtonIcon.src = crossSymbol;
    deleteButtonIcon.classList.add('project-div-icon');
    deleteButtonIcon.alt = 'Cross icon';
    deleteButton.append(deleteButtonIcon);

    const tasksCountHeader = document.createElement('p');
    tasksCountHeader.classList.add('project-div-tasks-count');
    tasksCountHeader.textContent = `${project.tasks.length} tarefa(s) concluídas`;

    titleAndDeleteButtonDiv.append(iconTitleDiv, deleteButton);
    actionsDiv.append(tasksCountHeader, toggleTasksButton);
    projectInfoDiv.append(titleAndDeleteButtonDiv, actionsDiv);

    const tasksContainer = document.createElement('div');
    tasksContainer.classList.add('project-history-tasks');

    const sortedTasks = [...project.tasks].sort((a, b) => {
        const dateA = new Date(a.completedDate || a.createdAt || 0);
        const dateB = new Date(b.completedDate || b.createdAt || 0);
        return dateA - dateB;
    });

    if (sortedTasks.length === 0) {
        const emptyText = document.createElement('p');
        emptyText.classList.add('project-history-empty');
        emptyText.textContent = 'Este projeto não possui tarefas concluídas registradas.';
        tasksContainer.append(emptyText);
    } else {
        sortedTasks.forEach(task => {
            const taskRow = document.createElement('div');
            taskRow.classList.add('project-history-task-row');

            const taskRowHeader = document.createElement('div');
            taskRowHeader.classList.add('project-history-task-row-header');

            const taskIcon = document.createElement('img');
            taskIcon.classList.add('task-icon');
            taskIcon.src = calendarCheckSymbol;
            taskIcon.alt = 'Calendar check icon';

            const taskTitle = document.createElement('p');
            taskTitle.classList.add('project-history-task-title');
            taskTitle.textContent = task.title;

            const taskIconTitleDiv = document.createElement('div');
            taskIconTitleDiv.classList.add('project-history-task-icon-title-div');
            taskIconTitleDiv.append(taskIcon, taskTitle);

            const taskDescription = document.createElement('p');
            taskDescription.classList.add('project-history-task-description');
            taskDescription.textContent = task.description;

            taskRowHeader.append(taskIconTitleDiv, taskDescription);

            const taskMeta = document.createElement('p');
            taskMeta.classList.add('project-history-task-meta');
            const completedDate = task.completedDate ? new Date(task.completedDate).toLocaleDateString('pt-BR') : 'sem data';
            taskMeta.textContent = `Finalizada em ${completedDate}`;

            taskRow.append(taskRowHeader, taskMeta);
            tasksContainer.append(taskRow);
        });
    }

    toggleTasksButton.addEventListener('click', () => {
        const isOpen = tasksContainer.classList.toggle('is-open');
        toggleTasksButton.textContent = isOpen ? 'Ocultar tarefas' : 'Mostrar tarefas';
    });

    const bottomDivider = createOverlayDivider();
    bottomDivider.classList.add('task-div-divider');

    projectDiv.append(projectInfoDiv, tasksContainer, bottomDivider);

    return {
        element: projectDiv,
        projectId: project.id,
        projectTitle: projectTitle,
        deleteButton: deleteButton
    };
}

export function createProjectCompletedWarning(daysAgoCompleted) {
    const warningDiv = document.createElement('div');
    warningDiv.classList.add('completed-warning');

    const today = new Date().setHours(0, 0, 0, 0);
    const completedDate = new Date(today - (daysAgoCompleted * 24 * 60 * 60 * 1000));

    const warningIcon = document.createElement('img');
    warningIcon.src = calendarCheckSymbol;
    warningIcon.alt = 'Calendar check icon';
    warningIcon.classList.add('project-icon');

    const warningText = document.createElement('p');
    warningText.classList.add('completed-warning-text');
    warningText.textContent = `Completo há ${daysAgoCompleted} dia(s) - Finalizado dia: ${completedDate.toLocaleDateString()}`;

    warningDiv.append(warningIcon, warningText);

    return warningDiv;
}

export function createPendingTasksWarningOverlay(projectTitle, pendingTasksCount) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-content', 'delete-overlay', 'pending-tasks-warning-overlay');

    const message = document.createElement('p');
    message.classList.add('overlay-message');

    if (pendingTasksCount === 1) {
        message.innerHTML = `O projeto "<strong>${projectTitle}</strong>" não pode ser concluído porque existe 1 tarefa pendente.`;
    } else {
        message.innerHTML = `O projeto "<strong>${projectTitle}</strong>" não pode ser concluído porque existem ${pendingTasksCount} tarefas pendentes.`;
    }

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('delete-confirmation-buttons');

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('overlay-button-content', 'cancel');
    cancelButton.setAttribute('type', 'button');
    cancelButton.textContent = 'Entendi';

    buttonsDiv.append(cancelButton);
    overlay.append(message, buttonsDiv);

    return {
        element: overlay,
        cancelButton,
    };
}

export function createDeleteProjectPendingOverlay(projectTitle, pendingTasksCount) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay-content', 'delete-overlay', 'delete-project-pending-overlay');

    const message = document.createElement('p');
    message.classList.add('overlay-message');
    message.innerHTML = `O projeto "<strong>${projectTitle}</strong>" possui <strong>${pendingTasksCount}</strong> tarefa(s) pendente(s).<br>Não é possível excluir o projeto enquanto houver tarefas pendentes. Finalize ou exclua as tarefas antes de remover o projeto.`;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('delete-confirmation-buttons');

    const closeButton = document.createElement('button');
    closeButton.classList.add('overlay-button-content', 'cancel');
    closeButton.setAttribute('type', 'button');
    closeButton.textContent = 'Fechar';

    buttonsDiv.append(closeButton);
    overlay.append(message, buttonsDiv);

    return {
        element: overlay,
        cancelButton: closeButton
    };
}

function createSelectProjectButtonProjectView(projectTitle) {
    const selectProjectButton = document.createElement('button');
    selectProjectButton.classList.add('overlay-button-content');
    selectProjectButton.setAttribute('type', 'button');

    const selectProjectButtonFirstIcon = document.createElement('img');
    selectProjectButtonFirstIcon.classList.add('overlay-button-content-icon');
    selectProjectButtonFirstIcon.src = hashtagSymbol;
    selectProjectButtonFirstIcon.alt = 'Hashtag icon';

    const selectProjectButtonSecondIcon = document.createElement('img');
    selectProjectButtonSecondIcon.classList.add('overlay-button-content-icon');
    selectProjectButtonSecondIcon.src = arrowDownIcon;
    selectProjectButtonSecondIcon.alt = 'Arrow down icon';

    selectProjectButton.append(selectProjectButtonFirstIcon, ` ${projectTitle} `, selectProjectButtonSecondIcon);

    // Método customizado para o botão recriar a si mesmo sem perder a referência das imagens importadas
    selectProjectButton.updateSelection = (project) => {
        if (project === null) {
            selectProjectButtonFirstIcon.src = mailBoxIcon;
            selectProjectButton.replaceChildren(selectProjectButtonFirstIcon, ' Entrada ', selectProjectButtonSecondIcon);
        } else {
            selectProjectButtonFirstIcon.src = hashtagSymbol;
            selectProjectButton.replaceChildren(selectProjectButtonFirstIcon, ` ${project.title} `, selectProjectButtonSecondIcon);
        }
    };

    return selectProjectButton;
}

// #endregion

// #region Funções auxiliares para criar elementos do conteúdo
export function createViewWithoutTasks(titleTextContent, p1TextContent, p2TextContent) {
    const view = document.createElement('div');
    view.classList.add('content-container');

    const headerContainer = document.createElement('div');
    headerContainer.classList.add('content-header');

    const title = createContentTitle(titleTextContent);

    headerContainer.append(title);

    const p1 = p1TextContent;
    const p2 = p2TextContent;
    const wrapper = createContentWrapper(lokalImage, 'Lokal logo', p1, p2);

    view.append(headerContainer, wrapper);
    return view;
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




