var express = require('express');
var router = express.Router();
var questionController = require('../controllers/questionController.js');
var answerController = require('../controllers/answerController.js');

router.get('/', questionController.list);

router.get('/create', questionController.showCreate);
router.get('/hot', questionController.hot);
router.post('/create', questionController.create);

router.get('/delete/:questionId', questionController.remove);

router.get('/show/:questionId/solution/:answerId', questionController.solution);
router.get('/show/:questionId', questionController.show);

router.get('/upvote/:questionId', questionController.upvote);
router.get('/downvote/:questionId', questionController.downvote);


/*
router.get('/login', questionController.showLogin);
router.get('/profile', questionController.profile);
router.get('/logout', questionController.logout);
router.get('/:id', questionController.show);

router.post('/', questionController.create);
router.post('/login', questionController.login);

router.put('/:id', questionController.update);

router.delete('/:id', questionController.remove);
*/

module.exports = router;
