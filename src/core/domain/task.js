// Fábrica (factory)
export function createTask(
    {
        // Destructuring para sempre criar as variáveis mesmo quando o objeto passado não tem elas.
        id = generateId(),
        title,
        description = '',
        dueDate = null,
        priority = 'baixa',
        isCompleted = false
    }
) {
    let _id = id;
    let _title = title;
    let _description = description;
    let _dueDate = dueDate;
    let _priority = priority;
    let _isCompleted = isCompleted;

    return {

        // Getters garantem closure e impedem sobrescrita.
        get id() { return _id; },
        get title() { return _title; },
        get description() { return _description; },
        get dueDate() { return _dueDate; },
        get priority() { return _priority; },
        get isCompleted() { return _isCompleted; },

        // Funções que funcionarão como setters.
        updateTitle(newTitle) {
            if (!newTitle || newTitle.trim() === '') {
                throw new Error("O título da tarefa não pode ser vazio.");
            }

            _title = newTitle.trim();
        },

        updatePriority(newPriority) {
            const allowedPriorities = ['baixa', 'média', 'alta'];
            if (!allowedPriorities.includes(newPriority.toLowerCase())) {
                throw new Error("Prioridade inválida");
            }

            _priority = newPriority.toLowerCase();
        },

        toggleStatus(){
            _isCompleted = !_isCompleted;
        },

        toJSON() {
            return {
                id: _id,
                title: _title,
                description: _description,
                dueDate: _dueDate,
                priority: _priority,
                isCompleted: _isCompleted
            }
        }
    }
}

function generateId(){
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}