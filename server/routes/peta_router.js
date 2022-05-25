const express = require('express');
const router = express.Router();

const { petaKecamatanModel, petaKelurahanDesaModel } = require('../models/peta_model');

// create get route
router.get('/', async (req, res) => {
  console.log("sini router get peta");
  res.status(200).send({ message: 'connected to peta' })
})

// create '/kecamatan' get route
router.get('/kecamatan', async (req, res) => {
  try {
    // const nama = req.query.nama;
    let data;
    // if (nama == null) {
    //   data = await petaKecamatanModel.find({});
    // }else
    data = await petaKecamatanModel.findOne({
      kecamatan: "Enrekang"
    });
    console.log("sini cari kecamatan");
    res.status(200).send({ data: data });
  } catch (error) {
    console.log(error, " ini error di peta kecamatan");
    res.status(500).send({ message: 'Internal Server Error' });
  }


})

// create '/kelurahan_desa' get route
router.get('/kelurahan_desa', async (req, res) => {
  try {
    const kelurahan_desa = req.query.kelurahan_desa;
    let data;
    if(kelurahan_desa != null && kelurahan_desa != ""){
      data = await petaKelurahanDesaModel.findOne({
        kelurahan_desa: kelurahan_desa
      });
    }else{
      // exclude polygon
      data = await petaKelurahanDesaModel.find().select('-polygon');
    }
    console.log("sini cari kelurahan_desa");
    res.status(200).send({ data: data });
  } catch (error) {
    console.log(error, " ini error di peta kelurahan desa");
    res.status(500).send({ message: 'Internal Server Error' });
  }


})

module.exports = router;