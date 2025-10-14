const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const pickUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Faltan campos' });

    const normalized = String(email).trim().toLowerCase();

    const exists = await User.findOne({ email: normalized });
    if (exists) return res.status(409).json({ error: 'Email ya registrado' });

    const user = new User({
      name: String(name).trim(),
      email: normalized,
      password: String(password)
    });
    await user.save();

    const token = sign(user);
    return res.status(201).json({ token, user: pickUser(user) });
  } catch (e) {
    console.error('register:', e);
    return res.status(500).json({ error: 'Error al registrar' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    const normalized = String(email).trim().toLowerCase();
    const pwdRaw  = String(password);
    const pwdTrim = pwdRaw.trim();

    const user = await User.findOne({ email: normalized });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const isHashed = user.password && user.password.startsWith('$2');

    // 1) probar tal cual
    let ok = false;
    if (isHashed) ok = await user.comparePassword(pwdRaw);
    else ok = user.password === pwdRaw;

    // 2) si falla y hay espacios, probar con trim()
    if (!ok && pwdTrim !== pwdRaw) {
      if (isHashed) ok = await user.comparePassword(pwdTrim);
      else {
        ok = user.password === pwdTrim;
        if (ok) { user.password = pwdTrim; await user.save(); }
      }
    }

    // 3) si matcheó y estaba plano, migrar a hash
    if (ok && !isHashed) { user.password = pwdRaw; await user.save(); }

    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = sign(user);
    return res.json({ token, user: pickUser(user) });
  } catch (e) {
    console.error('login:', e);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'No encontrado' });
    return res.json({ user: pickUser(user) });
  } catch (e) {
    console.error('me:', e);
    return res.status(500).json({ error: 'Error' });
  }
};
