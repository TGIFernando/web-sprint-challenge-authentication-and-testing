const router = require('express').Router();
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../../config/secrets")
const AModel = require('./auth-model')

const restricted = require("../middleware/restricted")

router.post('/register',  AModel.isValid, AModel.checkUsernameUnique, async (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  const credentails = req.body
  const rounds = Number(process.env.BCRYPT_ROUNDS || 5)
  const hash = bcryptjs.hashSync(credentails.password, rounds)
  credentails.password = hash
  const user = {username: credentails.username, password: credentails.password}
  try {
    const newUser = await AModel.add(user)
    res.status(201).json(newUser)
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post('/login', AModel.isValid,(req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */

  const { username, password} = req.body
  AModel.findBy({ username: username})
      .then(([user]) => {
        if ( user && bcryptjs.compareSync(password, user.password)){
          const token = makeToken(user)
          res.status(200).json({
            message: `welcome, ${user.username}`,
            token: token
          })
        } else {
          res.status(401).json("invalid credentials")
        }
      }) .catch (err => {
        res.status(401).json("invalid credentials")
      })
});

function makeToken(user){
  const payload = {
    subject: user.id,
    username: user.username,
  }
  const options = {
    expiresIn: 900
  }
  return jwt.sign(payload, jwtSecret, options)
}

router.get("/users", restricted,async (req, res) => {
  const users = await AModel.getAll()
  res.status(200).json(users)
})

module.exports = router;
