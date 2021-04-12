const express = require('express');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRouter = require('./app');

const app = express();
process.env.MONGO_URI = 'mongodb+srv://User1:Password1@cluster0.k7b6l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.use('/api/exercise', userRouter)

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
