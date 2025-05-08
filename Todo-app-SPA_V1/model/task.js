const db = require('../data/mysql/database');

class Task {
    
    constructor(title, description, userId, index, toFinishDate, priority) {
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.index = index;
        this.toFinishDate = toFinishDate;
        this.priority = priority;
        
    };

   static async getProfil(userId) {
        const [userData] = await db.query('SELECT * FROM user WHERE id_user = ?', [userId]);
        return userData;
    };

   async addNewTask() {
    if(!this.toFinishDate) {
        this.toFinishDate = null;
    };

    if(!this.priority) {
        this.toFinishDate = null;
    };
      const [response] = await db.query('INSERT INTO task (title, description, to_finish, priority, user_id, listindex) VALUES (?, ?, ?, ?, ?, ?)', [this.title, this.description, this.toFinishDate, this.priority, this.userId, this.index]);
      return response;   
    };

    async updateTaskList(index, task_id) {
       const response = await db.query('Update task SET listindex = ? WHERE idtask = ?', [index, task_id]);
       return response;
    };
    // static ? und mit einem Left Join arbeiten
    async getTask() { 
        const [tasks] = await db.query('SELECT * FROM task WHERE user_id = ?', [this.userId]);
        return tasks;      
    };

    // should be seperately used, belongs to the whole app, not to the task
   static async getPrioritys() {
       const [priority] = await db.query('SELECT * FROM priority');
       return priority;
    };

    async deleteTask(request, response) {
        const task_id = request.body.id;
        const deleteTask = await db.query('DELETE FROM task WHERE idtask = ?', [task_id]);
        return deleteTask;
        
    };
    
    async updateTask(request, response) {
        const task = request.body;
        console.log(task)
        await db.query('UPDATE task SET title = ?, description = ?, priority = ?, to_finish = ? WHERE idtask = ?', [task.title, task.description, task.priority, task.date, task.id]);
       
    };

    async getSingleTask(taskId) {
        const [task] = await db.query('SELECT * FROM task WHERE idtask= ?', [taskId]);
        return task;
    };
};

module.exports = Task;