const mongoose = require('mongoose');

const petaKecamatanSchema = new mongoose.Schema({
  kecamatan : {
    type: String,
  },
  polygon:{
    type: Array,
  }
})

const petaKelurahanDesaSchema = new mongoose.Schema({
  kecamatan_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  kelurahan_desa: {
    type: String,
  },
  polygon:{
    type: Array,
  }
})

const petaKecamatanModel = mongoose.model('tb_kecamatan', petaKecamatanSchema , 'tb_kecamatan');
const petaKelurahanDesaModel = mongoose.model('tb_kelurahan_desa', petaKelurahanDesaSchema , 'tb_kelurahan_desa');

module.exports = {petaKecamatanModel, petaKelurahanDesaModel};