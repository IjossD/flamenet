const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value:   { type: Number, required: true }, 
    estado:  { type: String, enum: ['Normal', 'Precaución', 'Alerta', 'Peligro crítico'] },
    time:    { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reading', readingSchema);