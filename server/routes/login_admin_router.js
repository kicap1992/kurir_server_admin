//create express router
const express = require('express');
const router = express.Router();


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

// crate get
router.get('/', session, async (req, res) => {
    try {
      const username = req.query.username;
      const password = req.query.password;

      if(username != 'admin' && password != 'admin'){
       return res.status(401).send({ status: false, message: 'username or password is wrong' })
      }

      data =  {
        role :'admin',
        ini : 'aran'
      }

      // expired in 1 day
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET , { expiresIn: '1d' });
     
      
      req.session.data = {
        accessToken: accessToken,
        role : "admin"
      }

      await req.session.save();

      return res.status(200).send({ status: true, message: 'login success'  , accessToken: accessToken })

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
})

// create '/logout' get method
router.get('/logout', session, authenticateToken , async (req, res) => {
  try{

    console.log(req.session)
    // req.session.destroy();
    return res.status(200).send({ status: true, message: 'logout success' })
  }
  catch(error){
    console.log(error);
    res.status(500).send({ message: error.message });
  }
})

// create '/' post 
router.post('/', authenticateToken, async (req, res) => {
  console.log(req.user);
  res.status(200).send({ status: true, message: 'login success' , user: req.user })
})

function authenticateToken(req,res,next){
  // console.log(req.session , " ini authenticate")
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if(token == null) return res.sendStatus(401)
  req.session.destroy();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if(err) return res.sendStatus(403)
    req.session.destroy();
    req.user = user
    next()
  })
}





module.exports = router;