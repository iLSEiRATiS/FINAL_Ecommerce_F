const { Router } = require('express');
const { register, login, me } = require('../controllers/auth.controller');

let auth = require('../middlewares/auth');
if (typeof auth !== 'function' && auth && typeof auth.auth === 'function') auth = auth.auth;

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;
