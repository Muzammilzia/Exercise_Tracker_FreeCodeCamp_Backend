const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const { default: mongoose } = require('mongoose')
const fccUser = require('./schema/fccUser')

app.use(cors())
app.use(bodyParser.urlencoded())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', async (req, res) => {
  const users = await fccUser.find().select({ logs: 0 });
  res.send(users)
})

app.post('/api/users', async (req, res) => {
  try {
    const user = await new fccUser(req.body);
    user.save().then(response => {
      res.json({
        _id: response._id,
        username: response.username
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      error: error.message
    })
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  console.log(req.params._id)
  const user = await fccUser.findOne({ _id: req.params._id });
  console.log(user)
  if (!user) {
    res.json({ error: 'invalid user' })
  } else {
    let date = new Date(req.body.date)
    if (date == "Invalid Date") {
      date = new Date()
    }
    const obj = {}
    obj.description = req.body.description || user.description;
    obj.duration = req.body.duration || user.duration;
    obj.date = date;

    user.log.push(obj)

    user.save().then(response => {
      res.json({
        _id: user._id,
        username: user.username,
        date: date.toDateString(),
        duration: Number(req.body.duration),
        description: req.body.description,
      })
    })
  }
})

app.get('/api/users/:_id/logs/', async (req, res) => {
  let i = 0
  const user = await fccUser.findOne({ _id: req.params._id });
  const arr = user.log.map((item, index) => {
    let { _id, ...obj } = item._doc
    return {
      ...obj,
      date: item.date.toDateString()
    }
  }).filter((item, index) => {
    if (Number(req.query.limit) <= i) {
      return false
    };
    if (!req.query.from && !req.query.to) {
      i++
      return true
    };
    const itemDate = new Date(item.date)
    const fromDate = new Date(req.query.from)
    const toDate = new Date(req.query.to)
    if (itemDate.getTime() > fromDate.getTime() && itemDate.getTime() < toDate.getTime()) {
      i++
      return true
    } else {
      return false
    }
  })
  res.json({
    _id: user._id,
    username: user.username,
    count: arr.length,
    log: arr
  })
})

mongoose.connect('mongodb+srv://muzzammil:muzzammil@cluster0.uz2iouw.mongodb.net/?retryWrites=true&w=majority', () => {
  console.log("Database Connected")
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})