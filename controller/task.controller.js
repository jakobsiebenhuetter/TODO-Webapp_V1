const Task = require('../model/task');

// Eigentlich kann man getProfil gleich in getApp verwenden und den user dann programmatikalisch im browserseitigen JavaScript weiterbearbeitn
async function getProfil(request, response) {
    const [userData] = await Task.getProfil(request.session.userId);
    response.json(userData);
};

async function getApp(request, response) {
    const task = new Task(request.body.title, request.body.description, request.session.userId);
    const tasks = await task.getTask();
    response.json(tasks);
};

async function getPrioritys(request, response) {
    // Trennen
    const prioritys = await Task.getPrioritys();
    // response.json({tasks: tasks, prioritys: prioritys});   würde das gehen????
    // if(request.session.isAuth) {
        return response.json(prioritys);
    // }

    // return response.json({error: 'no access'});
};

async function addTask(request, response) {

    const task = new Task(request.body.title, request.body.description, request.session.userId, request.body.index, request.body.toFinishDate, request.body.priority);
    const data = await task.addNewTask();
    response.json(data.insertId)
};

async function deleteTask(request, response) {
    const task = new Task();
    const deletedTask = await task.deleteTask(request, response);
    response.json(deletedTask)

};

async function updateTask(request, response) {
    const task = new Task();
    await task.updateTask(request, response);
    response.json('Success');
};

async function updateTaskList(request, response) {
    const task = new Task();
    await task.updateTaskList(request.body.index, request.body.taskId);
    response.json('TaskList updated')

};

async function getSingleTask(request, response) {
    const task = new Task();
    const getTask = await task.getSingleTask(request.body.taskId);
    return response.json(getTask);
};



module.exports = {
    getApp: getApp,
    getPrioritys: getPrioritys,
    addTask: addTask,
    deleteTask: deleteTask,
    updateTask: updateTask,
    updateTaskList: updateTaskList,
    getProfil: getProfil,
    getSingleTask: getSingleTask
};