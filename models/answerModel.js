var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var answerSchema = new Schema({
	'content' : {type: String, required: true},
    'postedBy' : {
        type: Schema.Types.ObjectId,
        ref: 'user', // mogoce users?
        required: true,
        immutable: true
    },
	'created' : {type: Date, required: true, immutable: true},
    'upvotes': {type: [ {type: Schema.Types.ObjectId, ref: 'user', required: true} ]},
    'downvotes': {type: [ {type: Schema.Types.ObjectId, ref: 'user', required: true} ]},
    'question' : {
        type: Schema.Types.ObjectId,
        ref: 'question', // mogoce qeustions?
        required: true,
    },
});

var Answer = mongoose.model('answer', answerSchema);
module.exports = Answer;
