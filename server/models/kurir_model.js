const mongoose = require('mongoose');

const pengaturanPengirimanSchema = new mongoose.Schema({
  id_kurir: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
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
  }
})

const pengaturanPengirimanModel = mongoose.model('tb_pengaturan_pengiriman', pengaturanPengirimanSchema , 'tb_pengaturan_pengiriman');

module.exports = {pengaturanPengirimanModel};