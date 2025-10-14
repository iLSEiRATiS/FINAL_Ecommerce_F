const router = require('express').Router();
const { list, tree } = require('../controllers/category.controller');


router.get('/', list);
router.get('/tree', tree);


module.exports = router;