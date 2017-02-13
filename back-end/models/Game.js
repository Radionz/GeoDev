var QuestionsAnsweredSchema = new mongoose.Schema({
  questionId: String,
  answer: String,
  status:  { type : String, enum: ['NOT_ANSWERED', 'ANSWERED', 'VALID', 'INVALID'], default: 'NOT_ANSWERED'},
},{ _id : false });

var ScoreBoardSchema = new mongoose.Schema({
  user: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required : true},
  loc: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
  },
  score: { type : Number, default: 0 },
  questionsAnswered: [QuestionsAnsweredSchema]
},{ _id : false });

var GameSchema = new mongoose.Schema({
    name: { type : String, required : true, index: {unique: true} },
    questions: [String],
    scoreBoard: [ScoreBoardSchema],
    duration: { type : Number, default: 90 },
    playerNb: { type : Number, default: 5 },
    status: { type : String, default : 'NOT_STARTED' },
    started_at: { type: Date },
    updated_at: { type: Date, default: function(){return new Date().getTime()} }
});

module.exports = mongoose.model('Game', GameSchema);
