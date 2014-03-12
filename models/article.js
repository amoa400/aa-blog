var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.ObjectId;

var articleSchema = new Schema({
  alias: String,
  title: String,
  content: String,
  abstract: String,
  create_time: {type: Date, default: new Date()},
  view_count: {type: Number, default: 0},
  comment: [{
    name: String,
    content: String,
    create_time: Date
  }]
});

articleSchema.set('autoIndex', false);
articleSchema.index({id: 1});
articleSchema.index({alias: 1});  // uinique todo
articleSchema.index({title: 1});
articleSchema.index({create_time: 1});

mongoose.model('Article', articleSchema);
