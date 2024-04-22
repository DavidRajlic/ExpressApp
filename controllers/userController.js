var UserModel = require('../models/userModel.js');
var QuestionModel = require('../models/questionModel.js');
var AnswerModel = require('../models/answerModel.js');
const fs = require('fs');
const path = require('path');
const { downvote } = require('./answerController.js');

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: function (req, res) {
        var user = new UserModel({
			username : req.body.username,
			password : req.body.password,
			email : req.body.email
        });

        user.save(function (err, user) {
            if (err) {
                console.error('Error when creating user:', err);
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            //return res.status(201).json(user);
            return res.redirect('/user/login');
        });
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
			user.password = req.body.password ? req.body.password : user.password;
			user.email = req.body.email ? req.body.email : user.email;
			
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    showRegister: function(req, res){
        res.render('user/register');
    },

    showLogin: function(req, res){
        res.render('user/login');
    },

    login: function(req, res, next){
        UserModel.authenticate(req.body.username, req.body.password, function(err, user){
            if(err || !user){
                //var err = new Error('Wrong username or paassword');
                //err.status = 401;
                //return next(err);
                console.log("kul")
                return res.render('user/login', { error: 'Wrong username or password', username: req.body.username, password: req.body.password });
            }
            req.session.userId = user._id;
            res.redirect('/user/profile');
        });
    },

    profile: function(req, res,next){
        searchUserId = req.session.userId;
        if (req.params.id != undefined) {searchUserId = req.params.id}
        UserModel.findById(searchUserId)
        .exec(function(error, user){
            if(error){
                return next(error);
            } else{
                if(user===null){
                    var err = new Error('Not authorized, go back!');
                    err.status = 400;
                    return next(err);
                } else{
                    var counter = {};
                    counter.questionCount = 0; counter.answerCount = 0; counter.bestRating = 0;
                    QuestionModel.count({postedBy: user._id}, function(err, count) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(count)
                            counter.questionCount = count;
                        }
                        AnswerModel.find({postedBy: user._id}).populate("upvotes").populate("downvotes").exec(function(err, answers) {
                            if (err) {
                                console.error(err);
                            } else {
                                answers.forEach(function(answer) {
                                    if (counter.answerCount == 0) {counter.bestRating = answer.upvotes.length - answer.downvotes.length}
                                    if (answer.upvotes.length - answer.downvotes.length > counter.bestRating) {
                                        counter.bestRating = answer.upvotes.length - answer.downvotes.length;
                                    }
                                })
                                counter.answerCount = Number(counter.answerCount) + 1;
                            }
                            photo_path = "/images/profile_pictures/default.png";
                            if (user.image != undefined) {
                                const imagePath = path.join(__dirname, '..', 'public', 'images', 'profile_pictures', 'users', user.image);
                                fs.access(imagePath, fs.constants.F_OK, (err) => {
                                    if (!err) {
                                        console.log(counter)
                                        return res.render('user/profile', {user: user, photo_path: "/images/profile_pictures/users/" + user.image, counter: counter});
                                    } else {
                                        return res.render('user/profile', {user: user, photo_path: "/images/profile_pictures/users/" + user.image, counter: counter});
                                    }
                                });
                            } else {
                                return res.render('user/profile', {user: user, photo_path: photo_path, counter: counter});
                            }   
                        });
                    });
                }
            }
        });  
    },

    uploadProfilePicture: function(req, res) {
        UserModel.findById(req.session.userId)
        .exec(function(error, user){
            if(error){
                return next(error);
            } 
            if(user===null){
                var err = new Error('Not authorized, go back!');
                err.status = 400;
                return next(err);
            } else{
                if (user.image != undefined) {
                    const imagePath = path.join(__dirname, '..', 'public', 'images', 'profile_pictures', 'users', user.image);
                    fs.access(imagePath, fs.constants.F_OK, (err) => {
                        if (err) {
                            console.error('Error:', err);
                        } else {
                            fs.unlink(imagePath, (err) => {
                                if (err) {
                                    console.error('Error:', err);
                                } else {
                                    console.log('Image deleted successfully');
                                }
                            });
                        }
                    });
                }
                user.image = req.file.newName;
                user.save(function (err, user) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating user.',
                            error: err
                        });
                    }
                    //return res.json(user);
                    return res.redirect("/user/profile");
                });
            }    
        });        
    },

    logout: function(req, res, next){
        if(req.session){
            req.session.destroy(function(err){
                if(err){
                    return next(err);
                } else{
                    return res.redirect('/');
                }
            });
        }
    }
};
