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

  // middleware
  server.use(formData.parse());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  server.options('*', cors());
  server.use(cors());

  // import routes
  const login_router = require('./routes/login_router');

  // use routes
  server.use('/login', login_router);

  // connect to mongodb
  mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, family: 4})
  let db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    console.log('connected to mongodb');
  })
  

  server.get('/api/shows', (req, res) => {
    return res.end('Hello World')
  });

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err

    // console.log(`ini dia ${process.env.DB_CONNECTION}`)
    console.log(`> Ready on http://localhost:${port}`)
  })
})