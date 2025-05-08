const routes = require('express');

const commentController = require('../controller/comment.controller');

const router = routes.Router();

router.post('/getComments', commentController.getComments);
router.post('/setComment', commentController.setComment);

module.exports = router;
