const express = require('express');
const router = express.Router();
const md5 = require('md5');

const { pengaturanPengirimanModel } = require('../models/kurir_model');
const { kurirModel, loginUserModel , pengirimModel} = require('../models/users_model');
const { pengirimanBarangModel } = require('../models/pengirim_model');

let googlenya = require('../google/googleapi.js');
const pengirim_folder_id = process.env.PENGIRIM_FOLDER_ID;
const kurir_folder_id = process.env.KURIR_FOLDER_ID;
const ktp_kurir_folder_id = process.env.KTP_KURIR_FOLDER_ID;
const ktp_holding_kurir_folder_id = process.env.KTP_HOLDING_KURIR_FOLDER_ID;
const kenderaan_kurir_folder_id = process.env.KENDERAAN_KURIR_FOLDER_ID;

async function cek_user_kurir(req, res, next) {
  if (req.query.username == null && req.query.password == null && req.query.id == null) return res.status(401).send({ message: 'Not Authorized' });
  const cek_login = await loginUserModel.findOne({
    username: req.query.username,
    password: req.query.password,
    role: 'kurir'
  })
  if (!cek_login) return res.status(401).send({ message: 'Not Authorized' });
  const cek_kurir = await kurirModel.findOne({
    _id: req.query.id
  })
  if (!cek_kurir) return res.status(401).send({ message: 'Not Authorized' });
  next()
}

// create '/pengaturan' post route
router.post('/pengaturan', cek_user_kurir, async (req, res) => {
  console.log('masuk post pengaturan');
  const minimal_biaya_pengiriman = req.body.minimal_biaya_pengiriman;
  const maksimal_biaya_pengiriman = req.body.maksimal_biaya_pengiriman;
  const biaya_per_kilo = req.body.biaya_per_kilo;

  const cek_data = await pengaturanPengirimanModel.findOne({
    kurir: req.query.id
  });
  let message, datanya;
  if (cek_data) {
    datanya = await pengaturanPengirimanModel.findOneAndUpdate({
      kurir: req.query.id,
    }, {
      biaya_minimal: minimal_biaya_pengiriman,
      biaya_maksimal: maksimal_biaya_pengiriman,
      biaya_per_kilo: biaya_per_kilo,
      updated_at: new Date()
    })

    await kurirModel.findOneAndUpdate({
      _id: req.query.id
    }, {
      pengaturan_pengiriman: datanya._id
    })
    message = 'Pengaturan pengiriman berhasil diubah';

  } else {
    datanya = new pengaturanPengirimanModel({
      kurir: req.query.id,
      biaya_minimal: minimal_biaya_pengiriman,
      biaya_maksimal: maksimal_biaya_pengiriman,
      biaya_per_kilo,
      created_at: new Date(),
      updated_at: new Date()
    });
    await datanya.save();
    await kurirModel.findOneAndUpdate({
      _id: req.query.id
    }, {
      pengaturan_pengiriman: datanya._id
    })

    // save to pengaturanPengirimanModel reference to kurirModel

    message = 'Pengaturan biaya pengiriman berhasil dibuat';
    console.log("data baru");
  }

  res.status(200).send({ message: message, data: datanya });
})

// create '/pengaturan' get route
router.get('/pengaturan', cek_user_kurir, async (req, res) => {
  // router.get('/pengaturan', async (req, res) => {
  console.log('masuk get pengaturan');
  const cek_data = await pengaturanPengirimanModel.findOne({
    kurir: req.query.id
  });
  if (!cek_data) return res.status(200).send({ message: 'Pengaturan tidak ditemukan', data: null });
  res.status(200).send({ message: 'Pengaturan pengiriman berhasil ditemukan', data: cek_data });
})

// create '/pengiriman_kurir_dalam_pengesahan' get route
router.get('/pengiriman_kurir_dalam_pengesahan', async (req, res) => {
  try {
    console.log('masuk get pengiriman_kurir_dalam_pengesahan');
    const cek_data = await pengirimanBarangModel.find({
      kurir: req.query.id,
      status: 'Dalam Pengesahan Kurir'
    }).select(' -kurir -__v ').populate({
      path: 'pengirim',
      select: '-__v -created_at -updated_at -status'

    });
    res.status(200).send({ message: 'Data berhasil ditemukan', data: cek_data });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }


})

// create '/pengirim' get route
router.get('/pengirim', async (req, res) => {
  console.log('masuk get pengirim');
  // get all pengirim
  const cek_data = await pengirimModel.find().select('-__v -created_at -updated_at');
  res.status(200).send({ message: 'Data berhasil ditemukan', data: cek_data });
})

module.exports = router;

