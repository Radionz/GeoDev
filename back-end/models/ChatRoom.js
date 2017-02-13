var ChatRoom = new mongoose.Schema({
  name:  { type : String, required : true },
  messages: [{ type : mongoose.Schema.Types.ObjectId, ref: 'Message', required : true }],
  users: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User', required : true }]
});

module.exports = mongoose.model('ChatRoom', ChatRoom);
