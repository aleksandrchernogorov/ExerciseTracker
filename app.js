const mongoose = require('mongoose');
const express = require('express');


/*I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.

I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will be the user object with also with the exercise fields added.
I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).

*/




const exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: String
  }
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  log: [exerciseSchema]
})

const Exercises = mongoose.model('Exercise', exerciseSchema);
const Users = mongoose.model('User', userSchema);

const userRouter = express.Router();


userRouter.route('/new-user')
.post((req, res, next) => {
  // I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
  Users.create(req.body)
  .then((user) => {
    res.json(user)
  }, err => next(err))
  .catch(err => next(err))
})

userRouter.route('/users')
.get((req, res, next) => {
  // I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
  Users.find({})
  .then((users) => {
    res.json(users)
  }, err => next(err))
  .catch(err => next(err));
})

userRouter.route('/add')
.post((req, res, next) => {
  console.log(req.body);
  if (req.body.date == '' || !req.body.date) {
    req.body.date = new Date().toDateString();
  }
  req.body.date = new Date(req.body.date).toDateString();
  Exercises.create(req.body)
  .then((exercise) => {
    Users.findByIdAndUpdate(req.body.userId, {$push: {log: exercise}}, {new: true})
    .then((user) => {
      let responseObj = {}
      responseObj['_id'] = user.id;
      responseObj['username'] = user.username;
      responseObj['date'] = new Date(exercise.date).toDateString();
      responseObj['duration'] = exercise.duration;
      responseObj['description'] = exercise.description;
      console.log(responseObj);
      res.json(responseObj)
    }, err => next(err))
    .catch(err => next(err))
  })
  .catch(err => next(err))
})

userRouter.route('/log')
.get((req, res, next) => {
  if(req.query.from && req.query.to && req.query.limit) {
    Users.findById(req.query.userId)
    .then((user) => {
      // I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
      let newLog = [...user.log].sort((a,b) => {
        let c = new Date(a.date).getTime(); 
        let d = new Date(b.date).getTime();
        if ( c > d ) {
          return 1;
        } else if ( c < d) {
          return -1;
        } else {
          return 0;
        }
      });

      const filtered = newLog.filter(el => {
        let a = new Date(el.date).getTime();
        let b = new Date(req.query.from).getTime();
        let c = new Date(req.query.to).getTime();

        if (a >= b && a <= c) {
          return a
        }
      });

      let responseObj = {};
      responseObj["_id"] = user.id;
      responseObj["username"] = user.username;
      responseObj["from"] = new Date(req.query.from).toDateString();
      responseObj["to"] = new Date(req.query.to).toDateString();
      let count = 0;
      responseObj["log"] = filtered.slice(0, Number(req.query.limit));
      for (i in responseObj.log) {
        count++
      }
      responseObj["count"] = count;
      console.log(responseObj);
      res.json(responseObj);
  })}
  else if(req.query.from && req.query.limit) {
    Users.findById(req.query.userId)
    .then((user) => {
      // I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
      let newLog = [...user.log].sort((a,b) => {
        let c = new Date(a.date).getTime(); 
        let d = new Date(b.date).getTime();
        if ( c > d ) {
          return 1;
        } else if ( c < d) {
          return -1;
        } else {
          return 0;
        }
      });

      const filtered = newLog.filter(el => {
        let a = new Date(el.date).getTime();
        let b = new Date(req.query.from).getTime();

        return a >= b;
      });

      let responseObj = {};
      responseObj["_id"] = user.id;
      responseObj["username"] = user.username;
      responseObj["from"] = new Date(req.query.from).toDateString();
      let count = 0;
      responseObj["log"] = filtered.slice(0, Number(req.query.limit));
      for (i in responseObj.log) {
        count++
      }
      responseObj["count"] = count;
      console.log(responseObj);
      res.json(responseObj);
    }, err => next(err))
    .catch(err => next(err));
  } else if (req.query.to && req.query.limit) {
    Users.findById(req.query.userId)
    .then((user) => {
      // I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
      let newLog = [...user.log].sort((a,b) => {
        let c = new Date(a.date).getTime(); 
        let d = new Date(b.date).getTime();
        if ( c > d ) {
          return 1;
        } else if ( c < d) {
          return -1;
        } else {
          return 0;
        }
      });

      const filtered = newLog.filter(el => {
        let a = new Date(el.date).getTime();
        let b = new Date(req.query.to).getTime();

        return a <= b;
      });

      let responseObj = {};
      responseObj["_id"] = user.id;
      responseObj["username"] = user.username;
      responseObj["from"] = new Date(req.query.to).toDateString();
      let count = 0;
      responseObj["log"] = filtered.slice(0, Number(req.query.limit));
      for (i in responseObj.log) {
        count++
      }
      responseObj["count"] = count;
      console.log(responseObj);
      res.json(responseObj);
  })} else if(req.query.from) {
    Users.findById(req.query.userId)
    .then((user) => {
      // I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
      let newLog = [...user.log].sort((a,b) => {
        let c = new Date(a.date).getTime(); 
        let d = new Date(b.date).getTime();
        if ( c > d ) {
          return 1;
        } else if ( c < d) {
          return -1;
        } else {
          return 0;
        }
      });

      const filtered = newLog.filter(el => {
        let a = new Date(el.date).getTime();
        let b = new Date(req.query.from).getTime();

        return a >= b;
      });

      let responseObj = {};
      responseObj["_id"] = user.id;
      responseObj["username"] = user.username;
      responseObj["from"] = new Date(req.query.from).toDateString();
      let count = 0;
      for (i in filtered) {
        count++
      }
      responseObj["count"] = count;
      responseObj["log"] = filtered;
      console.log(responseObj);
      res.json(responseObj);
    }, err => next(err))
    .catch(err => next(err));
  } else if (req.query.to) {
    Users.findById(req.query.userId)
    .then((user) => {
      // I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
      let newLog = [...user.log].sort((a,b) => {
        let c = new Date(a.date).getTime(); 
        let d = new Date(b.date).getTime();
        if ( c > d ) {
          return 1;
        } else if ( c < d) {
          return -1;
        } else {
          return 0;
        }
      });

      const filtered = newLog.filter(el => {
        let a = new Date(el.date).getTime();
        let b = new Date(req.query.to).getTime();

        return a <= b;
      });

      let responseObj = {};
      responseObj["_id"] = user.id;
      responseObj["username"] = user.username;
      responseObj["from"] = new Date(req.query.to).toDateString();
      let count = 0;
      for (i in filtered) {
        count++
      }
      responseObj["count"] = count;
      responseObj["log"] = filtered;
      console.log(responseObj);
      res.json(responseObj);
  })} else if (req.query.limit) {
  console.log(req.query);
  Users.findById(req.query.userId)
  .then((user) => {
    let responseObj = {};
    responseObj["_id"] = user.id;
    responseObj["username"] = user.username;
    let count = 0;
    for (i in user.log) {
      count++
    }
    responseObj["count"] = count;
    responseObj["log"] = user.log.slice(0, Number(req.query.limit));
    console.log(responseObj);
    res.json(responseObj);
  }, err => next(err))
  .catch(err => next(err))
  } else {
  console.log(req.query);
  Users.findById(req.query.userId)
  .then((user) => {
    let responseObj = {};
    responseObj["_id"] = user.id;
    responseObj["username"] = user.username;
    let count = 0;
    for (i in user.log) {
      count++
    }
    responseObj["count"] = count;
    responseObj["log"] = user.log;
    console.log(responseObj);
    res.json(responseObj);
  }, err => next(err))
  .catch(err => next(err))
  }
})




module.exports = userRouter;