const express = require('express');
const jwt     = require('jsonwebtoken');
const mongoose = require('mongoose');
const Reading = require('../models/Reading');
const router  = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'flamenet-dev-secret';
const ESP32_API_KEY = process.env.ESP32_API_KEY || 'flamenet-dev-esp32-key';
const FRESHNESS_WINDOW_MS = Number(process.env.READING_FRESHNESS_WINDOW_MS) || 60 * 1000;

// ─── ESTADO GLOBAL DEL LED ─────────────────
let ledState = false; // false = apagado, true = encendido

//  verifica usuario logueado   
function authUser(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No autorizado.' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido.' });
    }
}

// verifica que sea el ESP32 
function authESP32(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== ESP32_API_KEY) {
        return res.status(401).json({ error: 'API key inválida.' });
    }
    next();
}

function getFreshnessCutoff() {
    return new Date(Date.now() - FRESHNESS_WINDOW_MS);
}

// ── RUTA PARA EL ESP32: guardar lectura ───────────────
// El ESP32 manda un POST cada vez que toma una medición
router.post('/save', authESP32, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Base de datos no disponible.' });
        }

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
        if (mongoose.connection.readyState !== 1) {
            return res.json([]);
        }

        const readings = await Reading.find()
            .where('createdAt').gte(getFreshnessCutoff())
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(readings);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener historial.' });
    }
});

// ── RUTA PARA EL PANEL WEB: obtener lectura más reciente ──
// Devuelve un solo objeto con la lectura más nueva
router.get('/latest', authUser, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({ hasData: false });
        }

        const reading = await Reading.findOne()
            .where('createdAt').gte(getFreshnessCutoff())
            .sort({ createdAt: -1 });

        if (!reading) {
            return res.json({ hasData: false });
        }

        res.json({ hasData: true, ...reading.toObject() });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener lectura.' });
    }
});

module.exports = router;