const mongoose = require('mongoose');
const { deleteProductCascade } = require('./cascadeHelpers');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
  },
  highlights: [String],
  brand: String,
  category: {
    type: String,
    required: true,
    enum: [
      "Mobiles&Tablets", "Fashion", "Electronics", "Home&Furniture",
      "TVs&Appliances", "Beauty,Food&More", "Grocery","Others"
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  discountedPrice: Number,
  discountPercent: Number,
  stock: {
    type: Number,
    default: 1
  },
  images: [{ type: String }],
  seller:  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReviewRating"
    }
  ],
  isTrending: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('remove', async function(next) {
  try {
    await deleteProductCascade(this, null); // pass doc so helper can read images
    next();
  } catch (err) { next(err); }
});

// when code calls findByIdAndDelete / findOneAndDelete -> doc available in post hook
productSchema.post('findOneAndDelete', async function(doc) {
  if (!doc) return;
  try {
    // pass doc so helper can read images (doc still exists here)
    await deleteProductCascade(doc, null);
  } catch (e) { console.error('[productSchema.post findOneAndDelete] ', e); }
});

// deleteMany handling (collect docs first then process them)
productSchema.pre('deleteMany', async function(next) {
  const docs = await this.model.find(this.getFilter()).select('_id images');
  this._docsToCascade = docs;
  next();
});

productSchema.post('deleteMany', async function() {
  if (!this._docsToCascade) return;
  for (const doc of this._docsToCascade) {
    try { await deleteProductCascade(doc, null); } catch (e) { console.error(e); }
  }
});

module.exports = mongoose.model("Product", productSchema);
