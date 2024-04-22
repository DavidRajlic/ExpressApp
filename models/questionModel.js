var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var questionSchema = new Schema({
	'title' : {type: String, required: true},
	'description' : {type: String, required: true},
	'created' : {type: Date, required: true, immutable: true}, 
    'upvotes': {type: [ {type: Schema.Types.ObjectId, ref: 'user', required: true} ]},
    'downvotes': {type: [ {type: Schema.Types.ObjectId, ref: 'user', required: true} ]},
    'postedBy' : {
        type: Schema.Types.ObjectId,
        ref: 'user', // mogoce users?
        required: true,
        immutable: true
    },
    'solution' : {
        type: Schema.Types.ObjectId,
        ref: 'answer' // mogoce answers?
    },
});

var Question = mongoose.model('question', questionSchema);
module.exports = Question;