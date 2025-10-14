const { Router } = require('express');

let auth = require('../middlewares/auth');
let admin = require('../middlewares/admin');
const { create, mine, getById, listAll } = require('../controllers/orders.controller');

if (typeof auth !== 'function' && auth && typeof auth.auth === 'function') auth = auth.auth;
if (typeof admin !== 'function' && admin && typeof admin.admin === 'function') admin = admin.admin;

const router = Router();

// Usuario
router.post('/', auth, create);
router.get('/mine', auth, mine);
router.get('/:id', auth, getById);

// Admin
router.get('/', auth, admin, listAll);

module.exports = router;
