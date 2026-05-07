const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const router  = express.Router();

router.post('/register', async (req, res) => {
    console.log('1. Datos recibidos:', req.body);
    try {
    const { name, email, password } = req.body;
    console.log('2. Buscando si existe:', email);

    const exists = await User.findOne({ email });
    console.log('3. Usuario existe:', exists);

    if (exists) {
        return res.status(400).json({ error: 'Este correo ya está registrado.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log('4. Contraseña encriptada ok');

    const user = await User.create({ name, email, password: hashed });
    console.log('5. Usuario creado:', user);

    res.json({ message: '¡Cuenta creada exitosamente!', userId: user._id });

    } catch (err) {
    console.log('ERROR:', err.message);
    res.status(500).json({ error: 'Error del servidor.' });
    }
});

router.post('/login', async (req, res) => {
    try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign(
        { userId: user._id, name: user.name, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({ token, name: user.name, email: user.email });

    } catch (err) {
    res.status(500).json({ error: 'Error del servidor.' });
    }
});

module.exports = router;