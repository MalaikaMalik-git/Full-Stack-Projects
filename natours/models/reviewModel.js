const mongoose = require('mongoose');
const Tour = require('./tourModel');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// in this mongose go through two queries to find tour and user
ReviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
// What statics Means in Mongoose

// In Mongoose, there are two main types of custom methods you can add to a schema:

// Instance methods → used on individual documents

// Static methods → used on the entire model (collection)
ReviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 1,
      ratingsAverage: 4.5,
    });
  }
};

ReviewSchema.post('save', function () {
  // this.constructor is the Review model
  this.constructor.calcAverageRatings(this.tour);
});
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  //await this.findOne(); does NOT work here , query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
// we are doing parent referencing here because we dont want to grow tours with unlimted reviews so tours wot know about reviews but reviews will know they belong to tours
