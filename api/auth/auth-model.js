const db = require("../../data/dbConfig")

function isValid(req, res, next) {
    if (!req.body.username || !req.body.password){
        res.status(400).json("username and password required")
    } else {
        next()
    }
}

const checkUsernameUnique = async (req, res, next) => {
    try {
      const rows = await findBy({ username: req.body.username })
      if (!rows.length) {
        next()
      } else {
        res.status(401).json('username taken')
      }
    } catch (err) {
      res.status(500).json('something failed tragically')
    }
}

function findBy(filter) {
    return db("users")
      .select("id", "username", "password")
      .where(filter);
}

function findById(id){
    return db("users").where({id}).first()
}

async function add(user) {
    const [id] = await db("users").insert(user, "id");
    return findById(id);
}

async function getAll(){
    return db('users').select("id" ,"username")
}

module.exports = {
    isValid,
    checkUsernameUnique,
    findBy,
    add,
    getAll
}