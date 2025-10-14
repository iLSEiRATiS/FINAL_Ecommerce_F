function slugify(str) {
return (str || '')
.toString()
.normalize('NFD').replace(/[̀-ͯ]/g, '')
.toLowerCase()
.replace(/[^a-z0-9]+/g, '-')
.replace(/(^-|-$)/g, '');
}
module.exports = { slugify };