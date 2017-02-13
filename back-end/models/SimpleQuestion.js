// Load mongoose package
var mongoose = require('mongoose');

var SimpleQuestionSchema = new mongoose.Schema({
    name: { type : String, required : true, index: {unique: true} },
    question: String,
    radius: { type: Number, default: '10' },
    answerType: { type: String, enum: ['Text', 'Picture'], default: 'Text'},
    answer: String,
    nb_point: Number,
    clue_image: String,
    loc: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    updated_at: { type: Date, default: function(){return new Date().getTime()} }
});

SimpleQuestionSchema.index({loc:'2dsphere'});

module.exports = mongoose.model('SimpleQuestion', SimpleQuestionSchema);
