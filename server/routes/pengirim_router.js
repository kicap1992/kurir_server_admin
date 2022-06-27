const express = require('express');
const router = express.Router();


const { pengirimModel, kurirModel, loginUserModel } = require('../models/users_model');

const { pengaturanPengirimanModel } = require('../models/kurir_model');

const { pengirimanBarangModel } = require('../models/pengirim_model');


let googlenya = require('../google/googleapi.js');
const pengirim_folder_id = process.env.PENGIRIM_FOLDER_ID;
const kurir_folder_id = process.env.KURIR_FOLDER_ID;
const ktp_kurir_folder_id = process.env.KTP_KURIR_FOLDER_ID;
const ktp_holding_kurir_folder_id = process.env.KTP_HOLDING_KURIR_FOLDER_ID;
const kenderaan_kurir_folder_id = process.env.KENDERAAN_KURIR_FOLDER_ID;
const foto_barangan_pengiriman_folder_id = process.env.FOTO_BARANG_PENGIRIMAN_ID;

const io = require("socket.io-client");
const socket = io("http://localhost:3001/");

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
    }).select(' -created_at -updated_at -__v -ktp_url  -alamat').populate(
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
    }).select('-email -created_at -updated_at -__v -ktp_url  -alamat').populate(
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
    select: '-email -created_at -updated_at -__v -ktp_url    -alamat',
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

// create '/pengiriman_barang' post route
router.post('/pengiriman_barang', cek_user_pengirim, async (req, res) => {
  const id = req.query.id;
  const data = (req.body.data != null && req.body.data != '') ? JSON.parse(req.body.data) : null;

  const id_kurir = data.id_kurir;
  const nama_penerima = data.nama_penerima;
  const no_telpon_penerima = data.no_telpon_penerima;
  const alamat_penerima = data.alamat_penerima;
  const lokasi_pengiriman = data.lokasi_pengiriman;
  const kelurahan_desa_pengiriman = data.kelurahan_desa_pengiriman;
  const lokasi_permulaan = data.lokasi_permulaan;
  const biaya = data.biaya;

  const foto_pengiriman = req.files.foto_pengiriman;


  // console.log(id ,  id_kurir , nama_penerima , no_telpon_penerima , alamat_penerima , lokasi_pengiriman[0] , kelurahan_desa_pengiriman , lokasi_permulaan[1] , ":ini datanya");

  const data_created = await pengirimanBarangModel.create({
    nama_penerima: nama_penerima,
    no_telpon_penerima: no_telpon_penerima,
    alamat_penerima: alamat_penerima,
    kordinat_pengiriman: {
      lat: lokasi_pengiriman[0],
      lng: lokasi_pengiriman[1],
      kelurahan_desa: kelurahan_desa_pengiriman,
    },
    kordinat_permulaan: {
      lat: lokasi_permulaan[0],
      lng: lokasi_permulaan[1],
    },
    biaya: biaya,
    kurir: id_kurir,
    pengirim: id,
    history:{
      status_pengiriman : "Dalam Pengesahan Kurir"
    }
  });
  console.log(data_created._id, "ini data pengiriman barang")

  await pengirimModel.findByIdAndUpdate(id, {
    $push: {
      pengiriman_barang: data_created._id
    }
  })

  await kurirModel.findByIdAndUpdate(id_kurir, {
    $push: {
      pengiriman_barang: data_created._id
    }
  })
  res.status(200).send({ message: 'Berhasil menambahkan pengiriman barang' });

  let id_photo = googlenya.uploadFile(data_created._id + ".jpg", foto_pengiriman.path, foto_barangan_pengiriman_folder_id, "ini photo barang kiriman");

  const photo_url = `https://drive.google.com/uc?export=view&id=${await id_photo}`

  await pengirimanBarangModel.findByIdAndUpdate(data_created._id, {
    foto_pengiriman: photo_url
  })

  socket.emit('pengiriman_create', {
    id_pengiriman: data_created._id,
    id_pengirim: id,
  })


  // const idnya= "62940077b44339ec97fe519e"
  // const id_pengirim = '6260ba6b7b7d7a951d03d285'
  // const id_kurir = '629110cc793e75c08f7e2168'

  // // delete from pengirimModel in pengiriman_barang where idnya , where id = id_pengirim
  // await pengirimModel.findByIdAndUpdate(id_pengirim, {
  //   $pull: {
  //     pengiriman_barang: idnya
  //   }
  // })

  // // delete from kurirModel in pengiriman_barang where idnya , where id = id_kurir
  // await kurirModel.findByIdAndUpdate(id_kurir, {
  //   $pull: {
  //     pengiriman_barang: idnya
  //   }
  // })



  // console.log(id , id_kurir, nama_penerima, no_telpon_penerima, alamat_penerima, lat_lokasi_pengiriman, long_lokasi_pengiriman, kelurahan_desa, foto_pengiriman , "ini data yang dikirim");


})

// create '/log_kiriman' get route
// router.get('/log_kiriman', cek_user_pengirim, async (req, res) => {
router.get('/log_kiriman', async (req, res) => {
  const id = req.query.id;
  const data = await pengirimanBarangModel.find({ 
    pengirim: id,
  }).select('-pengirim -__v').populate({
    path: 'kurir',
    select: '-email -created_at -updated_at -__v -ktp_url  -alamat  -pengiriman_barang -ktp_holding_url -nik',
  })
  res.status(200).send({ data: data });
})

// create '/coba2' get route
router.get('/coba2', async (req, res) => {
  console.log("sini berlaku coba2 notif")
  socket.emit('coba2', {
      data: 'coba2'
    })
  res.status(200).send({ message: 'coba2' });
})

module.exports = router;