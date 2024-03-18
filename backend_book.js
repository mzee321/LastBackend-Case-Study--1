const express = require('express');
const mongoose = require('mongoose');
const UserModel = require('./library');
var cors = require('cors');

const app = express()
const port = 5000
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1/library_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

.then(db => console.log('DB is connected'))
.catch(err => console.log(err));


app.get('/', (req, res) => {
  UserModel.find()
  .then(Books => res.json(Books))
  .catch(err => res.json(err))
})



app.get('/get/:id', (req, res) => {
  const id = req.params.id
  UserModel.findById({_id: id})
  .then(Books => res.json(Books))
  .catch(err => res.json(err))
})

app.post('/create', (req, res) => {
    UserModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.json(err))
})

app.put('/update/:id', (req, res) => {
  const id = req.params.id;
  UserModel.findByIdAndUpdate({_id: id}, {
    BookName: req.body.BookName,
    Author: req.body.Author,
    YearPublished: req.body.YearPublished, 
    Publisher: req.body.Publisher
  }).then (user => res.json(user))
    .catch(err => res.json(err))
})

app.delete('/deleteuser/:id',(req, res) =>{
  const id = req.params.id;
  UserModel.findByIdAndDelete({_id: id})
  .then(response => res.json(response))
  .catch(err => res.json(err))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})