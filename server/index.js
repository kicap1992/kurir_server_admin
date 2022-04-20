const express = require('express')
const next = require('next')

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

  // use routes
  server.use('/api/login', login_router);

  // connect to mongodb
  mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, family: 4})
  let db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('connected to mongodb');
  })
  

  server.get('/api', (req, res) => {
    console.log("ada org request");
    return res.status(200).send({ status : true, message : 'connected to api'})
  });

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // server.listen(port, (err) => {
  //   if (err) throw err

  //   // console.log(`ini dia ${process.env.DB_CONNECTION}`)
  //   console.log(`> Ready on http://localhost:${port}`)
  // })
  http.createServer(server).listen(port, (err) => {
      if (err) throw err
  
      // console.log(`ini dia ${process.env.DB_CONNECTION}`)
      console.log(`> Ready on http://localhost:${port}`)
    })

  https.createServer (options, server).listen(3002, (err) => {
    if (err) throw err
  
    // console.log(`ini dia ${process.env.DB_CONNECTION}`)
    console.log(`> Ready on https://localhost:${3002}`)
  })
})