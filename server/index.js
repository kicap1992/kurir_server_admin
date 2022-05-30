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

  // use routes
  server.use('/api/login', login_router);
  server.use('/api/kurir', kurir_router);
  server.use('/api/pengirim', pengirim_router);
  server.use('/api/peta', peta_router);

  // connect to mongodb
  mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, family: 4 })
  let db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log('connected to mongodb');
  })


  const io = require("socket.io-client");
  const socket = io("http://localhost:3001/");

  server.get('/api', (req, res) => {
    console.log("ada org request");
    socket.emit('coba2', {
      data: 'coba2'
    })
    return res.status(200).send({ status: true, message: 'connected to api' })
  });

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
  const io2 = new Server(_server_https);

  io1.on('connection', (socket) => {
    console.log('socket connected');
    socket.on('coba2', (_) => {
      console.log(_.toString() +" ini di dia");
      io1.emit('coba1', {
        data: 'coba2'
      })
      
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

  _server_https.listen(3003, (err) => {
    if (err) throw err

    // console.log(`ini dia ${process.env.DB_CONNECTION}`)
    console.log(`> Ready on https://localhost:${3003}`)
  })
})