var express = require('express');
var router = express.Router();
var answerController = require('../controllers/answerController.js');


router.post('/create/:question_id', answerController.create);

router.get('/delete/:answerId', answerController.remove);

router.get('/upvote/:answerId', answerController.upvote);
router.get('/downvote/:answerId', answerController.downvote);

/*
router.get('/create', questionController.showCreate);
router.post('/create', questionController.create);

router.get('/show/:questionId', questionController.show);

router.get('/upvote/:questionId', questionController.upvote);
router.get('/downvote/:questionId', questionController.downvote);



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
