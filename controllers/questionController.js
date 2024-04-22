const session = require('express-session');
var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/answerModel.js');
var answerController = require('./answerController.js');
const path = require("path");
const fs = require("fs");
const moment = require('moment');

/**
 * photoController.js
 *
 * @description :: Server-side logic for managing photos.
 */
module.exports = {

    /**
     * photoController.list()
     */
    list: function (req, res) {
        QuestionModel.find()
        .populate('postedBy')  // Pridobi podatke o uporabniku
        .exec(function (err, questions) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question.',
                    error: err
                });
            }
            // Preverite, če so vprašanja pravilno pridobljena
            if (!questions) {
                return res.status(404).json({
                    message: 'Questions not found.'
                });
            }
            var data = {
                questions: questions  // Pravilno strukturirajte podatke za template
            };
            return res.render('questions/list', data);
        });
    },
    

    /**
     * photoController.show()
     */
    show: function (req, res) {
        var id = req.params.questionId;

        QuestionModel.findOne({_id: id}).populate('postedBy').populate('solution').exec(function (err, question) {
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
            // vprasanje
            question.score = question.upvotes.length - question.downvotes.length;
            if (question.upvotes.some(upvote => upvote.equals(req.session.userId))) {question.upvoted = true;}
            if (question.downvotes.some(downvote => downvote.equals(req.session.userId))) {question.downvoted = true;}
            if (question.postedBy._id.equals(req.session.userId)) {question.isMine = true;}
            
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
                    if (answer.upvotes.some(upvote => upvote.equals(req.session.userId))) {answer.upvoted = true;}
                    if (answer.downvotes.some(downvote => downvote.equals(req.session.userId))) {answer.downvoted = true;}
                    if (question.postedBy._id.equals(req.session.userId)) {answer.isMine = true; answer.canSetSolution = true;}
                    if (answer.postedBy._id.equals(req.session.userId)) {answer.isMine = true;}
                    if (!question.solution || !(question.solution._id.equals(answer._id))) {answer.display = true;} 
                    else {
                        // solution odgovor - se pokaze na vrhu
                        question.solution.score = question.solution.upvotes.length - question.solution.downvotes.length;
                        if (question.solution.upvotes.some(upvote => upvote.equals(req.session.userId))) {question.solution.upvoted = true;}
                        if (question.solution.downvotes.some(downvote => downvote.equals(req.session.userId))) {question.solution.downvoted = true;}
                    }
                });
                 //return res.json(question);
                return res.render('questions/show', {question: question, answers: answers});
            });
        });
    },


    showCreate: function(req, res){
        return res.render('questions/create');
    },

    /**
     * photoController.create()
     */
    create: function (req, res) {
        var id = req.session.userId;
        var question = new QuestionModel({
            title : req.body.title,
            description : req.body.description,
            created : Date.now(),
            upvotes : [],
            downvotes : [],
            postedBy : id,
        });
        question.save(function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating question',
                    error: err
                });
            }
    
            //return res.status(201).json(question);
            return res.redirect('/');
        });
    },

    upvote: function(req, res) {
        var userId = req.session.userId;
        var questionId = req.params.questionId;
        QuestionModel.findOne({_id: questionId}, function(err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }
            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            if (!question.upvotes.some(upvote => upvote.equals(userId))) { 
                var userIdIndex = question.downvotes.findIndex(downvote => downvote.equals(userId));
                if (userIdIndex !== -1) {
                    question.downvotes.splice(userIdIndex, 1);
                }    
                question.upvotes.push(userId)
                question.save(function (err, question) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting question.',
                            error: err
                        });
                    }
                });
            } 
            else {
                let userIdIndex = question.upvotes.findIndex(upvote => upvote.equals(userId));
                if (userIdIndex !== -1) {
                    question.upvotes.splice(userIdIndex, 1);
                }
                question.save(function (err, question) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting question.',
                            error: err
                        });
                    }
                });
            }
            return res.redirect('/')
        })
    },

    downvote: function(req, res) {
        var userId = req.session.userId;
        var questionId = req.params.questionId;
        QuestionModel.findOne({_id: questionId}, function(err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }
            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            if (!question.downvotes.some(downvote => downvote.equals(userId))) {
                var userIdIndex = question.upvotes.findIndex(upvote => upvote.equals(userId));
                if (userIdIndex !== -1) {
                    question.upvotes.splice(userIdIndex, 1);
                }  
                question.downvotes.push(userId)
                question.save(function (err, question) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting question.',
                            error: err
                        });
                    }
                });
            } 
            else {
                let userIdIndex = question.downvotes.findIndex(downvote => downvote.equals(userId));
                if (userIdIndex !== -1) {
                    question.downvotes.splice(userIdIndex, 1);
                }
                question.save(function (err, question) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when upvoting question.',
                            error: err
                        });
                    }
                });
            }
            return res.redirect('/')
        })
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

    hot: function(req, res) {

        QuestionModel.find()
        .lean() // Uporaba .lean() za hitrejše pridobivanje, ker ne potrebujemo Mongoose dokumentov
        .exec(function (err, questions) { // Izvedemo query
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question.',
                    error: err
                });
            }
    
            // Izračunamo 'score' za vsako vprašanje
            questions.forEach(question => {
                question.score = question.upvotes.length - question.downvotes.length;
            });
    
            // Razvrstimo vprašanja glede na 'score' od najvišjega do najnižjega
            questions.sort((a, b) => b.score - a.score);
    
            // Pošljemo podatke v predlogo
            return res.render('questions/list', { questions: questions });
        });
       
    },

    solution: function (req, res) {
        var answerId = req.params.answerId;
        var questionId = req.params.questionId;
        QuestionModel.findOne({_id: questionId}, function(err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }
            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }
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
                if (question.solution && question.solution._id.equals(answer._id)) {
                    question.solution = undefined;
                }
                else {
                    question.solution = answer._id;
                }
                question.save(function (err, question) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating question.',
                            error: err
                        });
                    }
                    //return res.json(question);
                    return res.redirect('/questions/show/' + question._id);
                });
            });        
        });    
    },

    /**
     * photoController.remove()
     */
    remove: function (req, res) {
        var userId = req.params.id;
        var questionId = req.params.questionId;
        AnswerModel.deleteMany({question: questionId}, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the answer.',
                    error: err
                });
            } 
        });
        QuestionModel.findByIdAndRemove(questionId, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the question.',
                    error: err
                });
            } 
            //return res.status(204).json();
            return res.redirect('/');
        });
    },

    publish: function(req, res){
        return res.render('photo/publish');
    }
};
