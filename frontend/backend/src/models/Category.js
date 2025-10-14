const mongoose = require('mongoose');
const { slugify } = require('../utils/slug');


const categorySchema = new mongoose.Schema({
name: { type: String, required: true, trim: true },
slug: { type: String, required: true, unique: true },
parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });


categorySchema.pre('validate', function(next) {
if (!this.slug && this.name) this.slug = slugify(this.name);
next();
});


module.exports = mongoose.model('Category', categorySchema);