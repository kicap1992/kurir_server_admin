const express = require('express');
const router = express.Router();


const { pengirimModel, kurirModel, loginUserModel } = require('../models/users_model');

const { pengaturanPengirimanModel } = require('../models/kurir_model');


let googlenya = require('../google/googleapi.js');
const pengirim_folder_id = process.env.PENGIRIM_FOLDER_ID;
const kurir_folder_id = process.env.KURIR_FOLDER_ID;
const ktp_kurir_folder_id = process.env.KTP_KURIR_FOLDER_ID;
const ktp_holding_kurir_folder_id = process.env.KTP_HOLDING_KURIR_FOLDER_ID;
const kenderaan_kurir_folder_id = process.env.KENDERAAN_KURIR_FOLDER_ID;

async function cek_user_pengirim(req, res, next) {
  if (req.query.username == null && req.query.password == null && req.query.id == null) return res.status(401).send({ message: 'Not Authorized' });
  const cek_login = await loginUserModel.findOne({
    username: req.query.username,
    password: req.query.password,
    role: 'pengirim'
  })
  if (!cek_login) return res.status(401).send({ message: 'Not Authorized' });
  const cek_pengirim = await pengirimModel.findOne({
    _id: req.query.id
  })
  if (!cek_pengirim) return res.status(401).send({ message: 'Not Authorized' });
  next()
}


// create get route
router.get('/', cek_user_pengirim, async (req, res) => {
  console.log("sini router get pengirim");
  res.status(200).send({ message: 'connected to pengirim' })
})

// create '/pengirim' get route
// router.get('/kurir', cek_user_pengirim, async (req, res) => {
router.get('/kurir', async (req, res) => {
  try {
    const data = await kurirModel.find({
      status: 'Aktif'
    }).select('-email -created_at -updated_at -__v -ktp_url    -_id -alamat').populate(
      {
        path: 'pengaturan_pengiriman',
      }
    ).exec();
    res.status(200).send({ data: data });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
})

// create '/pengirim/:nama' get route
router.get('/kurir/nama', cek_user_pengirim, async (req, res) => {
  try {
    const nama = (req.query.nama != null && req.query.nama != '') ? req.query.nama.toString() : '';
    const data = await kurirModel.find({
      nama: {
        $regex: nama,
        $options: 'i'
      }
    }).select('-email -created_at -updated_at -__v -ktp_url    -_id -alamat').populate(
      {
        path: 'pengaturan_pengiriman',

      }
    )
    res.status(200).send({ data: data });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
})

// create '/pengirim/filter/' get route
router.get('/kurir/filter/', cek_user_pengirim, async (req, res) => {

  const nama = (req.query.nama != null && req.query.nama != '') ? req.query.nama.toString() : '';
  const biaya_maksimal = (req.query.biaya_maksimal != null && req.query.biaya_maksimal != '') ? parseInt(req.query.biaya_maksimal.toString()) : '';
  const biaya_per_kilo = (req.query.biaya_per_km != null && req.query.biaya_per_km != '') ? parseInt(req.query.biaya_per_km.toString()) : '';

  const data = await pengaturanPengirimanModel.find(
    (biaya_per_kilo != '' && biaya_maksimal != '') ? {
      biaya_per_kilo: {
        $lte: biaya_per_kilo
      },
      biaya_maksimal: {
        $lte: biaya_maksimal
      }
    } :
      (biaya_per_kilo != '' && biaya_maksimal == '') ? {
        biaya_per_kilo: {
          $lte: biaya_per_kilo
        }
      } :
        (biaya_per_kilo == '' && biaya_maksimal != '') ? {
          biaya_maksimal: {
            $lte: biaya_maksimal
          }
        } : {}
  ).populate({
    path: 'kurir',
    select: '-email -created_at -updated_at -__v -ktp_url    -_id -alamat',
    match: {
      nama: {
        $regex: nama,
        $options: 'i'
      }
    }
  }).exec();
  console.log(data)

  res.status(200).send({ data: data });

})

module.exports = router;