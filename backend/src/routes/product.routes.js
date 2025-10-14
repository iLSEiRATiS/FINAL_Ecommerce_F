const router = require('express').Router();
const { list, getOne } = require('../controllers/product.controller');


router.get('/', list);
router.get('/:id', getOne);


module.exports = router;