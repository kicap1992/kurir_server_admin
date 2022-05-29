const mongoose = require('mongoose');

const pengaturanPengirimanSchema = new mongoose.Schema({
  biaya_minimal: {
    type: Number,
    required: true,
  },
  biaya_maksimal: {
    type: Number,
    required: true,
  },
  biaya_per_kilo: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  kurir:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tb_kurir'
  }]
})

const pengaturanPengirimanModel = mongoose.model('tb_pengaturan_pengiriman', pengaturanPengirimanSchema , 'tb_pengaturan_pengiriman');

module.exports = {pengaturanPengirimanModel};