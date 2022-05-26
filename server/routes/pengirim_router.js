const express = require('express');
const router = express.Router();


const {pengirimModel, kurirModel, loginUserModel} = require('../models/users_model');


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
router.get('/kurir', cek_user_pengirim, async (req, res) => {
  try {
    const data = await kurirModel.find({
      status: 'Aaaktif'
    }).select('-email -created_at -updated_at -__v -ktp_url  -kenderaan_url -photo_url -_id -alamat');
    res.status(200).send({data : data});
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
})

module.exports = router;