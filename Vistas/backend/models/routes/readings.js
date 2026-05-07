const express = require('express');
const jwt     = require('jsonwebtoken');
const Reading = require('../models/Reading');
const router  = express.Router();

// aqui se verifica que el usuario haya iniciado sesión y que el token sea válido
function authUser(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado.' });
    try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
    } catch {
    res.status(401).json({ error: 'Token inválido.' });
    }
}

// verifica que sea el ESP32 
function authESP32(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ESP32_API_KEY) {
    return res.status(401).json({ error: 'API key inválida.' });
    }
    next();
}

// ── RUTA PARA EL ESP32: guardar lectura ───────────────
// El ESP32 manda un POST cada vez que toma una medición
router.post('/save', authESP32, async (req, res) => {
    try {
    const { value, estado, time } = req.body;
    const reading = await Reading.create({ value, estado, time });
    res.json({ ok: true, reading });
    } catch (err) {
    res.status(500).json({ error: 'Error al guardar lectura.' });
    }
});

// ── RUTA PARA EL PANEL WEB: ver historial ─────────────
// El panel pide las lecturas cuando el usuario está logueado
router.get('/', authUser, async (req, res) => {
    try {
    const readings = await Reading.find()
        .sort({ createdAt: -1 })
        .limit(100);
    res.json(readings);
    } catch (err) {
    res.status(500).json({ error: 'Error al obtener historial.' });
    }
});

module.exports = router;