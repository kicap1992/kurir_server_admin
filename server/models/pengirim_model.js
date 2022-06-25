const mongoose = require('mongoose');

const pengirimanBarangSchema = new mongoose.Schema({
  nama_penerima: {
    type: String,
    required: true,
  },
  no_telpon_penerima: {
    type: String,
    required: true,
  },
  alamat_penerima: {
    type: String,
    required: true,
  },
  kordinat_pengiriman: {
    lat: {
      type: String,
      required: true,
    },
    lng: {
      type: String,
      required: true,
    },
    kelurahan_desa: {
      type: String,
      required: true,
    },
  },
  kordinat_permulaan: {
    lat: {
      type: String,
      required: true,
    },
    lng: {
      type: String,
      required: true,
    }
  },
  foto_pengiriman: {
    type: String
  },
  status_pengiriman: {
    type: String,
    default: 'Dalam Pengesahan Kurir',
  },
  biaya : {
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
    }
  },
  kurir: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tb_kurir'
  },
  pengirim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tb_pengirim'
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

const pengirimanBarangModel = mongoose.model('tb_pengiriman_barang', pengirimanBarangSchema, 'tb_pengiriman_barang');

module.exports = { pengirimanBarangModel };