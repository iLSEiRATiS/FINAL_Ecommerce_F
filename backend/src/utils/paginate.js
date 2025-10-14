function buildPagination({ page = 1, limit = 12 }) {
page = Math.max(parseInt(page) || 1, 1);
limit = Math.min(Math.max(parseInt(limit) || 12, 1), 60);
const skip = (page - 1) * limit;
return { page, limit, skip };
}
module.exports = { buildPagination };