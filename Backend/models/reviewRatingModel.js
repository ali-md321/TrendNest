const mongoose = require('mongoose');
const { deleteReviewCascade } = require('./cascadeHelpers');

const reviewRatingSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order',required: true},
  rating:  { type: Number, min: 1, max: 5, required: true },
  title:       { type: String, required: false },
  description: { type: String, required: false },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });


reviewRatingSchema.pre('remove', async function(next) {
  try {
    await deleteReviewCascade(this, null);
    next();
  } catch (err) { next(err); }
});

reviewRatingSchema.post('findOneAndDelete', async function(doc) {
  if (!doc) return;
  try { await deleteReviewCascade(doc, null); } catch (e) { console.error(e); }
});

reviewRatingSchema.pre('deleteMany', async function(next) {
  const docs = await this.model.find(this.getFilter()).select('_id images');
  this._docsToCascade = docs;
  next();
});

reviewRatingSchema.post('deleteMany', async function() {
  if (!this._docsToCascade) return;
  for (const doc of this._docsToCascade) {
    try { await deleteReviewCascade(doc, null); } catch (e) { console.error(e); }
  }
});


module.exports = mongoose.model('ReviewRating', reviewRatingSchema);