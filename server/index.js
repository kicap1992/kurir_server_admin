const express = require('express')
const next = require('next')
require("dotenv").config();

const mongoose = require('mongoose');
const formData = require('express-form-data');
const cors = require('cors');


const port = parseInt(process.env.PORT) || 3001
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// require('../dotenv/config')





app.prepare().then(() => {
  const server = express()
  const http = require('http')
  const https = require('https')
  const fs = require('fs')
  const { pengirimanBarangModel } = require('./models/pengirim_model');

  const options = {
    key: fs.readFileSync('./server/cert.key'),
    cert: fs.readFileSync('./server/cert.crt')
  }

  // middleware
  server.use(formData.parse());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.options('*', cors());
  server.use(cors());

  // import routes
  const login_router = require('./routes/login_router');
  const kurir_router = require('./routes/kurir_router');
  const pengirim_router = require('./routes/pengirim_router');
  const peta_router = require('./routes/peta_router');
  const login_admin_router = require('./routes/login_admin_router');
  const admin_router = require('./routes/admin_router')

  // use routes
  server.use('/api/login', login_router);
  server.use('/api/kurir', kurir_router);
  server.use('/api/pengirim', pengirim_router);
  server.use('/api/peta', peta_router);
  server.use('/api/login_admin', login_admin_router);
  server.use('/api/admin', admin_router);
  

  // connect to mongodb
  mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, family: 4 })
  let db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log('connected to mongodb');
  })


  // const io = require("socket.io-client");
  // const socket = io("http://localhost:3001/");

  server.get('/coba2', (req, res) => {
    console.log("sini coba2");
    // socket.emit('info_pengiriman', {
    //   id_pengirim: '62be1a1a97c4a38caea7a5d8',
    //   id_pengiriman: '62c0088948578c0819b90343'
    // }) // ini untuk info pengiriman refresh

    // socket.emit('info_detail_paket', {
    //   // id_pengirim: '62be1a1a97c4a38caea7a5d8',
    //   id_pengiriman: '62c0088948578c0819b90343'
    // }) // ini untuk info paket refresh
    return res.status(200).send({ status: true, message: 'connected to coba2' })
  })

  server.get('/api', (req, res) => {
    console.log("ada org request");

    return res.status(200).send({ status: true, message: 'connected to api' })
  });

  server.get('/api/check_paket' ,async  (req, res) => {
    try {
      const id_paket = req.query.id_paket;
      console.log(id_paket);
      const check = await pengirimanBarangModel.findOne({ _id: id_paket });
      if(!check) {
        return res.status(400).send({ status: false, message: 'paket tidak ditemukan' , data: null})
      }

      const cek_data = await pengirimanBarangModel.findOne({
        _id: id_paket,
        
      }).select(' -kurir -__v -pengirim').populate({
        path: 'pengirim',
        select: '-__v -created_at -updated_at -status'
  
      }).populate({
        path: 'kurir',
        select: '-__v -created_at -updated_at -status'
      })
      // console.log(data);
      return res.status(200).send({ status: true, message: 'connected to api' , data : cek_data })
    }catch(err){
      return res.status(500).send({ status: false, message: 'error' , data: null})
    }
  }) 

  server.use('/api', (req, res, next) => {
    res.status(404).send('404 not found');
  });

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // server.listen(port, (err) => {
  //   if (err) throw err

  //   // console.log(`ini dia ${process.env.DB_CONNECTION}`)
  //   console.log(`> Ready on http://localhost:${port}`)
  // })
  const _server = http.createServer(server);
  const _server_https = https.createServer(options, server);

  const { Server } = require("socket.io");
  const io1 = new Server(_server);
  // const io2 = new Server(_server_https);

  let users = {};
  io1.on('connection', (socket) => {
    let userId = socket.id;

    if (!users[userId]) users[userId] = [];
    users[userId].push(socket.id);


    console.log('socket connected', userId);
    socket.on('info_pengiriman', (_) => {
      console.log(_, " info_pengiriman");
      io1.emit('info_pengiriman_id=' + _.id_pengirim, {
        data: 'percobaan1',
        message: "ini terkirim ke user"
      })

    }); // ini untuk info pengiriman refresh

    socket.on('info_detail_paket', (_) => {
      console.log(_, " info_detail_paket");
      io1.emit('info_detail_paket=' + _.id_pengiriman, {
        data: 'percobaan1',
        message: "ini terkirim ke user"
      })

    }); // ini untuk info paket refresh

    socket.on('disconnect_it', (reason) => {
      console.log("sini untuk disconnect");
      console.log(reason);
      // REMOVE FROM SOCKET USERS
      // reason.remove(users[userId], (u) => u === socket.id);
      // if (users[userId].length === 0) {
      //   // ISER IS OFFLINE BROAD CAST TO ALL CONNECTED USERS
      //   console.log("offline", userId);
      //   // REMOVE OBJECT
        delete users[reason];
      // }

      socket.disconnect(); // DISCONNECT SOCKET

    });

    socket.on('disconnect', (reason) => {
      console.log("sini untuk disconnect1");
      console.log(reason);
      
    })
    

    socket.on('tambah_verifikasi_kurir', (_) => {
      console.log(_, " tambah_verifikasi_kurir");
      io1.emit('tambah_verifikasi_kurir')

    });
    socket.on('tambah_verifikasi_pengirim', (_) => {
      console.log(_, " tambah_verifikasi_pengirim");
      io1.emit('tambah_verifikasi_pengirim')

    });
  })

  // io2.on('connection', (socket) => {
  //   console.log('socket connected');
  // })

  _server.listen(port, (err) => {
    if (err) throw err

    // console.log(`ini dia ${process.env.DB_CONNECTION}`)
    console.log(`> Ready on http://localhost:${port}`)
  })

  // _server_https.listen(3003, (err) => {
  //   if (err) throw err

  //   // console.log(`ini dia ${process.env.DB_CONNECTION}`)
  //   console.log(`> Ready on https://localhost:${3003}`)
  // })
})