// Fábrica (factory)
export function createTask(
    {
        // Destructuring para sempre criar as variáveis mesmo quando o objeto passado não tem elas.
        id = generateId(),
        title,
        description = '',
        dueDate = null,
        completedDate = null,
        isCompleted = false,
        createdAt = Date.now(),
    }
) {
    let _id = id;
    let _title = title;
    let _description = description;
    let _dueDate = dueDate;
    let _completedDate = completedDate;
    let _isCompleted = isCompleted;
    let _createdAt = createdAt;

    return {

        // Getters garantem closure e impedem sobrescrita.
        get id() { return _id; },
        get title() { return _title; },
        get description() { return _description; },
        get dueDate() { return _dueDate; },
        get completedDate() { return _completedDate; },
        get isCompleted() { return _isCompleted; },
        get createdAt() { return _createdAt; },

        // Funções que funcionarão como setters.
        updateTitle(newTitle) {
            if (!newTitle || newTitle.trim() === '') {
                throw new Error("O título da tarefa não pode ser vazio.");
            }

            _title = newTitle.trim();
        },

        updateDescription(newDescription){
            _description = newDescription.trim();
        },

        updateDueDate(newDueDate){
            if(newDueDate && isNaN(Date.parse(newDueDate))){
                throw new Error("Data de vencimento inválida.");
            }

            _dueDate = newDueDate;
        },

        toggleStatus(completedDate){
            _isCompleted = !_isCompleted;
            _completedDate = _isCompleted? completedDate : null;
        },

        toJSON() {
            return {
                id: _id,
                title: _title,
                description: _description,
                dueDate: _dueDate,
                completedDate: _completedDate,
                isCompleted: _isCompleted,
                createdAt: _createdAt,
            }
        }
    }
}

function generateId(){
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}