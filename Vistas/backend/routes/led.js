const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'flamenet-dev-secret';
const ESP32_API_KEY = process.env.ESP32_API_KEY || 'flamenet-dev-esp32-key';

// ─── ESTADO GLOBAL DEL LED ─────────────────
let ledState = false; // false = apagado, true = encendido

// Verifica usuario logueado   
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

// Verifica que sea el ESP32 
function authESP32(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== ESP32_API_KEY) {
        return res.status(401).json({ error: 'API key inválida.' });
    }
    next();
}

// ── RUTA: Obtener estado del LED (para ESP32) ──────────
// El ESP32 consulta este endpoint para saber si debe encender el LED
router.get('/status', authESP32, (req, res) => {
    res.json({ led: ledState });
});

// ── RUTA: Cambiar estado del LED (desde panel web) ─────
// El panel web envía true/false para controlar el LED
router.post('/status', authUser, (req, res) => {
    const { led } = req.body;
    
    if (typeof led !== 'boolean') {
        return res.status(400).json({ error: 'El estado del LED debe ser boolean (true/false).' });
    }
    
    ledState = led;
    console.log(`LED ${led ? 'ENCENDIDO' : 'APAGADO'}`);
    
    res.json({ ok: true, led: ledState });
});

// ── RUTA: Obtener estado del LED (para panel web) ──────
router.get('/status-web', authUser, (req, res) => {
    res.json({ led: ledState });
});

module.exports = router;
