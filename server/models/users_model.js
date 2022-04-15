// create mongoose schema

const mongoose = require('mongoose');

const pengirimSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  no_telp: {
    type: String,
    required: true,
    length: [9, 13],
    unique: true
  },
  nama: {
    type: String,
    required: true
  },
  alamat: {
    type: String,
    required: true
  },
  photo_url: {
    type: String,
    // required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const kurirSchema = new mongoose.Schema({
  nik : {
    type: String,
    required: true,
    unique: true,
    length: [16, 16]
  },
  nama: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  no_telp: {
    type: String,
    required: true,
    length: [9, 13],
    unique: true
  },
  alamat: {
    type: String,
    required: true
  },
  no_kenderaan:{
    type: String,
    required: true,
  },
  status : {
    type: String,
    required: true,
    default: 'Evaluasi'
  },
  photo_url: {
    type: String,
    // required: true
  },
  kenderaan_url:{
    type: String,
    // required: true
  },
  ktp_url:{
    type: String,
    // required: true
  },
  ktp_holding_url:{
    type: String,
    // required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
});

const loginUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  _idnya :{
    type: mongoose.Schema.Types.ObjectId,
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
});

const pengirimModel = mongoose.model('tb_pengirim', pengirimSchema, 'tb_pengirim');
const kurirModel = mongoose.model('tb_kurir', kurirSchema, 'tb_kurir');
const loginUserModel = mongoose.model('tb_login', loginUserSchema, 'tb_login');

module.exports = { pengirimModel, kurirModel, loginUserModel };