const routes = require('express');


const taskController = require('../controller/task.controller');
const csrfProtection = require('../middleware/csrfprotection');

const router = routes.Router();
// Redundanz hier bei Protected Routes
function protectedRoutesMiddleware(request, response, next) {
    if(request.session.isAuth && request.session.userId) {
      return next()
    }
    response.redirect('/')
}

router.get('/app', csrfProtection, (request, response) => {
    if(request.session.isAuth && request.session.userId) {
      return response.render('todo-spa/todo-app')
    }
    response.redirect('/')
});

router.get('/get-user', protectedRoutesMiddleware, taskController.getProfil)

router.get('/getTasks', protectedRoutesMiddleware, taskController.getApp);

router.get('/get-prioritys', protectedRoutesMiddleware, taskController.getPrioritys);

router.post('/addTask', protectedRoutesMiddleware, taskController.addTask);

router.post('/update-tasks-index', protectedRoutesMiddleware, taskController.updateTaskList)

router.post('/delete-task', protectedRoutesMiddleware, taskController.deleteTask)

router.post('/update-task', protectedRoutesMiddleware, taskController.updateTask)

router.post('/getSingleTask', protectedRoutesMiddleware, taskController.getSingleTask)

module.exports = router;