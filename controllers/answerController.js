const session = require('express-session');
var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/answerModel.js');

/**
 * photoController.js
 *
 * @description :: Server-side logic for managing photos.
 */
module.exports = {

    /**
     * photoController.list()
     */
    list: function (req, question) {
        //QuestionModel.deleteMany({title: " dfb"}).exec()
        AnswerModel.find({question: question._id})
        .populate('postedBy').populate('question')
        .exec(function (err, answers) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answers.',
                    error: err
                });
            }
            answers.forEach(function(answer) {
                answer.score = answer.upvotes.length - answer.downvotes.length;
                if (answer.upvotes.some(upvote => upvote.equals(req.session.userId))) { 
                    answer.upvoted = true;
                }
                if (answer.downvotes.some(downvote => downvote.equals(req.session.userId))) { 
                    answer.downvoted = true;
                }
            });
            return answers;
        });
    },

    /**
     * photoController.show()
     */
    show: function (req, res) {
        var id = req.params.questionId;

        QuestionModel.findOne({_id: id}).populate('postedBy').exec(function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question.',
                    error: err
                });
            }

            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }
            question.score = question.upvotes.length - question.downvotes.length;
            if (question.upvotes.some(upvote => upvote.equals(req.session.userId))) { 
                question.upvoted = true;
            }
            if (question.downvotes.some(downvote => downvote.equals(req.session.userId))) { 
                question.downvoted = true;
            }
            //return res.json(question);
            return res.render('questions/show', {question});
        });
    },

    upvote: function(req, res) {
        var userId = req.session.userId;
        var answerId = req.params.answerId;
        AnswerModel.findOne({_id: answerId}, function(err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }
            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            if (!answer.upvotes.some(upvote => upvote.equals(userId))) { 
                var userIdIndex = answer.downvotes.findIndex(downvote => downvote.equals(userId));
                if (userIdIndex !== -1) {
                    answer.downvotes.splice(userIdIndex, 1);
                }    
                answer.upvotes.push(userId)
                answer.save(function (err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting answer.',
                            error: err
                        });
                    }
                });
            } 
            else {
                let userIdIndex = answer.upvotes.findIndex(upvote => upvote.equals(userId));
                if (userIdIndex !== -1) {
                    answer.upvotes.splice(userIdIndex, 1);
                }
                answer.save(function (err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting answer.',
                            error: err
                        });
                    }
                });
            }
            return res.redirect('/questions/show/' + answer.question._id);
        })
    },

    downvote: function(req, res) {
        var userId = req.session.userId;
        var answerId = req.params.answerId;
        AnswerModel.findOne({_id: answerId}, function(err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer',
                    error: err
                });
            }
            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            if (!answer.downvotes.some(downvote => downvote.equals(userId))) {
                var userIdIndex = answer.upvotes.findIndex(upvote => upvote.equals(userId));
                if (userIdIndex !== -1) {
                    answer.upvotes.splice(userIdIndex, 1);
                }  
                answer.downvotes.push(userId)
                answer.save(function (err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting answer.',
                            error: err
                        });
                    }
                });
            } 
            else {
                let userIdIndex = answer.downvotes.findIndex(downvote => downvote.equals(userId));
                if (userIdIndex !== -1) {
                    answer.downvotes.splice(userIdIndex, 1);
                }
                answer.save(function (err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting answer.',
                            error: err
                        });
                    }
                });
            }
            return res.redirect('/questions/show/' + answer.question._id);
        })
    },



    showCreate: function(req, res){
        return res.render('questions/create');
    },

    /**
     * photoController.create()
     */
    create: function (req, res) {
        var userId = req.session.userId;
        var questionId = req.params.question_id;
        var answer = new AnswerModel({
            content : req.body.content,
            postedBy : userId,
            created : Date.now(), 
            upvotes : [],
            downvotes : [], 
            question : questionId,
        });
        answer.save(function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating answer',
                    error: err
                });
            }
    
            //return res.status(201).json(question);
            return res.redirect('/questions/show/' + questionId);
        });
    },

    /**
     * photoController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        PhotoModel.findOne({_id: id}, function (err, photo) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting photo',
                    error: err
                });
            }

            if (!photo) {
                return res.status(404).json({
                    message: 'No such photo'
                });
            }

            photo.name = req.body.name ? req.body.name : photo.name;
			photo.path = req.body.path ? req.body.path : photo.path;
			photo.postedBy = req.body.postedBy ? req.body.postedBy : photo.postedBy;
			photo.views = req.body.views ? req.body.views : photo.views;
			photo.likes = req.body.likes ? req.body.likes : photo.likes;
			
            photo.save(function (err, photo) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating photo.',
                        error: err
                    });
                }

                return res.json(photo);
            });
        });
    },

    /**
     * photoController.remove()
     */
    remove: function (req, res) {
        var answerId = req.params.answerId;
        AnswerModel.findByIdAndRemove(answerId, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the answer.',
                    error: err
                });
            }
           // return res.status(204).json();
           return res.redirect('/questions/show/' + answer.question._id); 
        });
    },

    publish: function(req, res){
        return res.render('photo/publish');
    }
};
