const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flamenet';

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});
app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/led',      require('./routes/led'));

app.get('/health', (req, res) => {
    res.json({ ok: true, mongoReady: mongoose.connection.readyState === 1 });
});

async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(process.env.MONGO_URI ? 'Conectado a MongoDB Atlas' : 'Conectado a MongoDB local');
    } catch (err) {
        console.warn('MongoDB no disponible. El servidor seguirá corriendo para probar la UI localmente.');
        console.warn(err.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    });
}

startServer();