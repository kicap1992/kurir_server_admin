const express = require('express');
const router = express.Router();
const md5 = require('md5');

const { pengaturanPengirimanModel } = require('../models/kurir_model');
const { kurirModel, loginUserModel, pengirimModel } = require('../models/users_model');
const { pengirimanBarangModel } = require('../models/pengirim_model');

let googlenya = require('../google/googleapi.js');
const pengirim_folder_id = process.env.PENGIRIM_FOLDER_ID;
const kurir_folder_id = process.env.KURIR_FOLDER_ID;
const ktp_kurir_folder_id = process.env.KTP_KURIR_FOLDER_ID;
const ktp_holding_kurir_folder_id = process.env.KTP_HOLDING_KURIR_FOLDER_ID;
const kenderaan_kurir_folder_id = process.env.KENDERAAN_KURIR_FOLDER_ID;

const io = require("socket.io-client");
const socket = io("http://localhost:3001/");

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
router.get('/pengiriman_kurir_dalam_pengesahan', cek_user_kurir, async (req, res) => {
  try {
    console.log('masuk get pengiriman_kurir_dalam_pengesahan');
    const cek_data = await pengirimanBarangModel.find({
      kurir: req.query.id,
      // status = 'Dalam Pengesahan Kurir' or 'Disahkan Kurir'
      $or: [
        { status_pengiriman: 'Dalam Pengesahan Kurir' },
        { status_pengiriman: 'Disahkan Kurir' },
        { status_pengiriman: 'Mengambil Paket Pengiriman Dari Pengirim' },
        { status_pengiriman: 'Menghantar Paket Pengiriman Ke Penerima' },
      ]
    }).select(' -kurir -__v ').sort({ updated_at: -1 }).populate({
      path: 'pengirim',
      select: '-__v -created_at -updated_at -status'

    });
    res.status(200).send({ message: 'Data berhasil ditemukan', data: cek_data });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }


})

// create '/pengiriman_completed' get route
router.get('/pengiriman_completed', cek_user_kurir, async (req, res) => {
  try {
    // console.log('masuk get pengiriman_completed');
    const cek_data = await pengirimanBarangModel.find({
      kurir: req.query.id,
      // status = 'Dalam Pengesahan Kurir' or 'Disahkan Kurir'
      $or: [
        { status_pengiriman: 'Paket Diterima Oleh Penerima' },
      ]
    }).select(' -kurir -__v ').sort({ updated_at: -1 }).populate({
      path: 'pengirim',
      select: '-__v -created_at -updated_at -status'

    });
    res.status(200).send({ message: 'Data berhasil ditemukan', data: cek_data });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }


})


// create 'sahkan_pengiriman' post route
router.post('/sahkan_pengiriman', cek_user_kurir, async (req, res) => {
  try {
    const id_pengiriman = req.body.id_pengiriman;
    const cek_data = await pengirimanBarangModel.findOne({
      _id: id_pengiriman,
      kurir: req.query.id
    });

    if (!cek_data) return res.status(400).send({ message: 'Data tidak ditemukan', data: null });

    const cek_pengiriman = await pengirimanBarangModel.findOneAndUpdate({
      _id: id_pengiriman,
      kurir: req.query.id
    }
      , {
        status_pengiriman: 'Disahkan Kurir',
        // push to history
        $push: {
          history: {
            status_pengiriman: 'Disahkan Kurir',
          }
        },

        updated_at: new Date()
      }
      , { new: true }
    );
    // console.log(cek_pengiriman);

    res.status(200).send({ message: 'Pengiriman berhasil disahkan', data: cek_pengiriman });



  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }
})

// create '/pengirim' get route
router.get('/pengirim', cek_user_kurir, async (req, res) => {
  // console.log('masuk get pengirim');
  // get all pengirim
  const cek_data = await pengirimModel.find().select('-__v -created_at -updated_at');
  res.status(200).send({ message: 'Data berhasil ditemukan', data: cek_data });
})


// create '/detail_pengiriman' get route
router.get('/detail_pengiriman', cek_user_kurir, async (req, res) => {
  try {
    id_pengiriman = req.query.id_pengiriman;
    // console.log('masuk get detail_pengiriman');

    const cek_data = await pengirimanBarangModel.findOne({
      _id: id_pengiriman,
      kurir: req.query.id
    }).select(' -kurir -__v -pengirim').populate({
      path: 'pengirim',
      select: '-__v -created_at -updated_at -status'
    });

    if (!cek_data) return res.status(400).send({ message: 'Data tidak ditemukan', data: null });
    res.status(200).send({ message: 'Data berhasil ditemukan', data: cek_data });

  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }
})

// create 'mengambil_paket_pengiriman' post route
router.post('/mengambil_paket_pengiriman', cek_user_kurir, async (req, res) => {
  try {
    const id_pengiriman = req.body.id_pengiriman;
    const cek_data = await pengirimanBarangModel.findOne({
      _id: id_pengiriman,
      kurir: req.query.id
    });

    if (!cek_data) return res.status(400).send({ message: 'Data tidak ditemukan', data: null });

    const cek_pengiriman = await pengirimanBarangModel.findOneAndUpdate({
      _id: id_pengiriman,
      kurir: req.query.id
    }
      , {
        status_pengiriman: 'Mengambil Paket Pengiriman Dari Pengirim',
        // push to history
        $push: {
          history: {
            status_pengiriman: 'Mengambil Paket Pengiriman Dari Pengirim',
          }
        },

        updated_at: new Date()
      }
      , { new: true }
    );
    // console.log(cek_pengiriman);

    res.status(200).send({ message: 'Pengiriman berhasil disahkan', data: cek_pengiriman });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }
})


// create 'konfirmasi_terima_paket_pengirim' post route
router.post('/konfirmasi_terima_paket_pengirim', cek_user_kurir, async (req, res) => {
  try {
    const id_pengiriman = req.body.id_pengiriman;
    const cek_data = await pengirimanBarangModel.findOne({
      _id: id_pengiriman,
      kurir: req.query.id
    });

    if (!cek_data) return res.status(400).send({ message: 'Data tidak ditemukan', data: null });

    const cek_pengiriman = await pengirimanBarangModel.findOneAndUpdate({
      _id: id_pengiriman,
      kurir: req.query.id
    }
      , {
        status_pengiriman: 'Menghantar Paket Pengiriman Ke Penerima',
        // push to history
        $push: {
          history: {
            status_pengiriman: 'Menghantar Paket Pengiriman Ke Penerima',
          }
        },

        updated_at: new Date()
      }
      , { new: true }
    );
    // console.log(cek_pengiriman);

    socket.emit('info_detail_paket', {
      // id_pengirim: '62be1a1a97c4a38caea7a5d8',
      id_pengiriman: id_pengiriman,
    }) 

    res.status(200).send({ message: 'Paket pengiriman berhasil diterima dari pengirim\nMenghantar paket ke penerima', data: cek_pengiriman });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }
})


// create 'konfirmasi_terima_paket_penerima' post route
// router.post('/konfirmasi_terima_paket_penerima', cek_user_kurir, async (req, res) => {
router.post('/konfirmasi_terima_paket_penerima', async (req, res) => {
  try {
    const id_pengiriman = req.body.id_pengiriman;
    const cek_data = await pengirimanBarangModel.findOne({
      _id: id_pengiriman,
      kurir: req.query.id
    });

    if (!cek_data) return res.status(400).send({ message: 'Data tidak ditemukan', data: null });

    const cek_pengiriman = await pengirimanBarangModel.findOneAndUpdate({
      _id: id_pengiriman,
      kurir: req.query.id
    }
      , {
        status_pengiriman: 'Paket Diterima Oleh Penerima',
        // push to history
        $push: {
          history: {
            status_pengiriman: 'Paket Diterima Oleh Penerima',
          }
        },

        updated_at: new Date()
      }
      , { new: true }
    );
    // console.log(cek_pengiriman);
    socket.emit('info_detail_paket', {
      // id_pengirim: '62be1a1a97c4a38caea7a5d8',
      id_pengiriman: id_pengiriman,
    }) 

    res.status(200).send({ message: 'Paket pengiriman berhasil diterima oleh Penerima', data: cek_pengiriman });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }
})


// create 'profil' get route
router.get('/profil_kurir', cek_user_kurir, async (req, res) => {
  console.log("ini cek profilnya");
  try {
    const cek_data = await kurirModel.findOne({
      _id: req.query.id
    }).select('-__v -created_at -updated_at -pengaturan_pengiriman -pengiriman_barang');
    res.status(200).send({ message: 'Data berhasil ditemukan', data: cek_data });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error', data: null });
  }
  // res.status(200).send({ message: 'Data berhasil ditemukan'});
})

module.exports = router;

