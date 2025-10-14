const mongoose = require('mongoose');
const { slugify } = require('../utils/slug');


const productSchema = new mongoose.Schema({
name: { type: String, required: true, trim: true },
slug: { type: String, required: true, unique: true },
price: { type: Number, required: true, min: 0 },
description: { type: String, default: '' },
images: { type: [String], default: [] },
category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
stock: { type: Number, default: 100 },
active: { type: Boolean, default: true }
}, { timestamps: true });


productSchema.pre('validate', function(next) {
if (!this.slug && this.name) this.slug = slugify(this.name);
next();
});


module.exports = mongoose.model('Product', productSchema);