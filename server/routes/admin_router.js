//create express router
const express = require('express');
const router = express.Router();

const { pengirimModel, kurirModel } = require('../models/users_model');


var ironSession = require("iron-session/express").ironSession;
var session = ironSession({
  cookieName: "myapp_cookiename",
  // password: process.env.SECRET_COOKIE_PASSWORD,
  password: process.env.IRON_SESSION,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
});

const jwt = require('jsonwebtoken');

// create '/get_all_kurir' get method
router.get('/get_all_kurir_verifikasi', session, authenticateToken, async (req, res) => {
  try {
    const kurir = await kurirModel.find({
      status : 'Evaluasi'
    }).sort({ created_at: -1 })
    return res.status(200).send({ status: true, data: kurir })
  }
  catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
})

// create '/get_all_kurir' get method
router.get('/get_all_kurir', session, authenticateToken, async (req, res) => {
  try {
    const kurir = await kurirModel.find({
      status : 'Aktif'
    }).sort({ created_at: -1 })
    return res.status(200).send({ status: true, data: kurir })
  }
  catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
})


router.get('/get_all_pengirim', session, authenticateToken, async (req, res) => {
  try {
    const pengirim = await pengirimModel.find().sort({ created_at: -1 })
    return res.status(200).send({ status: true, data: pengirim })
  }
  catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
})


// create 'verifikasi_kurir' post method
router.post('/verifikasi_kurir', session, authenticateToken, async (req, res) => {
  try {
    const { id_kurir } = req.body;
    console.log(id_kurir, "ini id kurir di server")
    

    const kurir = await kurirModel.findByIdAndUpdate(id_kurir, {
      status : 'Aktif'
    });

    const kurir_all = await kurirModel.find({
      status : 'Evaluasi'
    });
    return res.status(200).send({ status: true, data: kurir_all })
  }
  catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
})


// create 'verifikasi_kurir' post method
router.post('/batalkan_kurir', session, authenticateToken, async (req, res) => {
  try {
    const { id_kurir } = req.body;
    console.log(id_kurir, "ini id kurir di server")
    

    const kurir = await kurirModel.findByIdAndUpdate(id_kurir, {
      status : 'Ditolak'
    });

    const kurir_all = await kurirModel.find({
      status : 'Evaluasi'
    });
    return res.status(200).send({ status: true, data: kurir_all })
  }
  catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
})

function authenticateToken(req, res, next) {
  // console.log(req.session, " ini authenticate")
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) {
    req.session.destroy();
    return res.sendStatus(401);
  }


  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      req.session.destroy();
      return res.sendStatus(403);
    }
    
    req.user = user
    next()
  })
}





module.exports = router;