const db = require('../data/mysql/database');


class Comment {

    async getComments(taskId) {

        const [comments] = await db.query('SELECT * FROM auth_todo.comment JOIN auth_todo.task ON auth_todo.comment.task_id = auth_todo.task.idtask WHERE auth_todo.task.idtask = ?', [taskId]);
        return comments;
    };

    async setComment(taskId, comment) {

      const [response] = await db.query('INSERT INTO auth_todo.comment (comment, task_id) VALUES( ?, ?)', [comment, taskId]);
       return response;
    };
};

module.exports = Comment;
