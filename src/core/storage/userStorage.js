// Aqui é o repositório que pega a devolução de usuário do localStorage e 'dá vida' pra ela.

import { createUser } from "../domain/user.js";
import { createProject } from "../domain/project.js";
import { createTask } from "../domain/task.js";
import { STORAGE_KEYS } from "./keys.js";

const userStorage = {
    saveUser(userObject) {
        const userJson = JSON.stringify(userObject.toJSON());
        localStorage.setItem(STORAGE_KEYS.USER_PREFIX + userObject.email, userJson);
    }, 

    getUser(email){
        const rawJson = localStorage.getItem(STORAGE_KEYS.USER_PREFIX + email);
        if(!rawJson) return null;

        const parsedData = JSON.parse(rawJson);

        // É necessário recriar o que veio do localStorage, ou 'reidratar' o que veio 'seco'.
        // Operador '||' usado como programação defensiva.
        const hydratedTasks = (parsedData.tasks || []).map(taskData => createTask(taskData));
        const hydratedProjects = (parsedData.projects || []).map(projData => {
            const projTasks = (projData.tasks || []).map(t => createTask(t));
            return createProject({...projData, tasks: projTasks });
        });

        return createUser({
            email: parsedData.email,
            password: parsedData.password,
            projects: hydratedProjects,
            tasks: hydratedTasks
        });
    },

    userExists(email){
        return localStorage.getItem(STORAGE_KEYS.USER_PREFIX + email) !== null;
    }
};

export { userStorage };