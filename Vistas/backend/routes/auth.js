const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const mongoose = require('mongoose');
const User    = require('../models/User');
const router  = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'flamenet-dev-secret';
const localUsers = new Map();

function useLocalAuth() {
    return mongoose.connection.readyState !== 1;
}

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (useLocalAuth()) {
            const normalizedEmail = String(email || '').trim().toLowerCase();
            if (localUsers.has(normalizedEmail)) {
                return res.status(400).json({ error: 'Este correo ya está registrado.' });
            }

            const hashed = await bcrypt.hash(password, 10);
            const user = { _id: `local-${Date.now()}`, name, email: normalizedEmail, password: hashed };
            localUsers.set(normalizedEmail, user);

            return res.json({ message: '¡Cuenta creada exitosamente!', userId: user._id, local: true });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ error: 'Este correo ya está registrado.' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user   = await User.create({ name, email, password: hashed });

        res.json({ message: '¡Cuenta creada exitosamente!', userId: user._id });

    } catch (err) {
        res.status(500).json({ error: 'Error del servidor.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (useLocalAuth()) {
            const user = localUsers.get(normalizedEmail);
            if (!user) {
                return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
            }

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
            }

            const token = jwt.sign(
                { userId: user._id, name: user.name, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({ token, name: user.name, email: user.email, local: true });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({ error: 'Correo o contraseña incorrectos.' });
        }

        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, name: user.name, email: user.email });

  } catch (err) {
    res.status(500).json({ error: 'Error del servidor.' });
  }
});

module.exports = router;