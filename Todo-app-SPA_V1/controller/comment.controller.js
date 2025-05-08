const Comment = require('../model/comment');

async function getComments(request, response) {
    const comments = new Comment();
    const data = await comments.getComments(request.body.taskId);
    return response.json(data);
};

async function setComment(request, response) {
    const comment = new Comment();
    const data = await comment.setComment(request.body.taskId, request.body.comment);
    return response.json(data)
};

module.exports = {
    getComments: getComments,
    setComment: setComment
};