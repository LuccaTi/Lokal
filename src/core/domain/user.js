// Fábrica
export function createUser({
    email,
    password,
    projects = [],
    tasks = []
}) {
    let _email = email;
    let _password = password;
    let _projects = [...projects];
    let _tasks = [...tasks];

    return {
        get email() { return _email; },
        get password() { return _password; },
        get projects() { return [..._projects]; },
        get tasks() { return [..._tasks]; },

        // Composição, o user gerencia projetos e tarefas.
        addProject(projectObject) {
            if (!projectObject || !projectObject.id) {
                throw new Error("Projeto inválido inserido.");
            }

            const exists = _projects.some(p => p.id === projectObject.id);
            if (!exists) {
                _projects.push(projectObject);
            }
        },

        removeProject(projectId) {
            _projects = _projects.filter(p => p.id !== projectId);
        },

        addTask(taskObject) {
            if (!taskObject || !taskObject.id) {
                throw new Error("Tarefa inválida inserida no usuário.");
            }

            const exists = _tasks.some(t => t.id === taskObject.id);
            if (!exists) {
                _tasks.push(taskObject);
            }
        },

        removeTask(taskId){
            _tasks = _tasks.filter(t => t.id !== taskId);
        },

        toJSON() {
            return {
                email: _email,
                password: _password,
                projects: _projects.map(p => typeof p.toJSON === 'function' ? p.toJSON() : p),
                tasks: _tasks.map(t => typeof t.toJSON === 'function' ? t.toJSON() : t)
            };
        }
    };
}