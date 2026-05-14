// Fábrica
export function createProject({
    id = generateId(),
    title,
    tasks = []
}) {
    let _id = id;
    let _title = title;

    // Spread operator usado para fazer uma cópia do array sem referências.
    let _tasks = [...tasks];

    return {
        get id() { return _id; },
        get title() { return _title; },

        // Retornada uma cópia do array para impedir pushs e pops sem usar os setters.
        // A cópia impede que os elementos dentro sejam alterados diretamente, mas permite adicionar ou remover mais deles, isso vai refletir só na cópia.
        get tasks() { return [..._tasks]; },

        updateTitle(newTitle){
            if(!newTitle || newTitle.trim() === ''){
                throw new Error("O título do projeto não pode ser vazio.");
            }

            _title = newTitle.trim();
        },

        // Comportamento de composição, o projeto sabe gerenciar tarefas:
        addTask(taskObject){

            // Validação estrutural.
            if (!taskObject || !taskObject.id){
                throw new Error("Tarefa inválida.");
            }

            // Validação de repetição.
            const exists = _tasks.some(t => t.id === taskObject.id);
            if(!exists){
                _tasks.push(taskObject);
            }
        },

        removeTask(taskId){
            _tasks = _tasks.filter(t => t.id !== taskId);
        },

        toJSON() {
            return {
                id: _id,
                title: _title,
                tasks: _tasks.map(t => typeof t.toJSON === 'function' ? t.toJSON() : t)
            };
        },
    }
}

function generateId() {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}