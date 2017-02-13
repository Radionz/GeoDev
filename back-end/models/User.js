var UserSchema = new mongoose.Schema({
  name:  { type : String, required : true },
  team:  { type : String, enum: ['blue', 'red', 'pink', 'yellow', 'green'], required : true, default: 'blue'},
  email: { type : String, required : true, index: {unique: true} },
  password: { type : String, required : true },
  role: { type : String, required : true,  enum: ['Player', 'Admin'], default: 'Player'},
  image: { type: String, required : false, default: '' },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
