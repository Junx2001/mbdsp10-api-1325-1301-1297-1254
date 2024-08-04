const mongoose = require('./mongoDb');

const ratingSchema = new mongoose.Schema({
  userId: Number,
  concerned_user_id: Number,
  review: String,
  rating: Number,
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
