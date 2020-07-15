if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const initializePassport = require('./passport-config')
 
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))  
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  console.log(users)
  res.render('index.ejs', { 
    name: req.user.name , 
    email: req.user.email,
    users:users})
}) 
   
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})  
  
app.post('/login', checkNotAuthenticatedAndPerform, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
}) 

app.post('/register', checkNotAuthenticated, async (req, res) => {
  
  for(let i=0;i<users.length;i++){
    if(users[i].email===req.body.email){
      res.redirect('/register')
      return;
    }
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    var d = new Date(Date.now());
    // console.log(d.toString(), " " ,)
    users.push({
      id:Date.now(),
      time: d.toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  // console.log(req.body)
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
function checkNotAuthenticatedAndPerform(req, res, next) {
  console.log("REQ " , req.body)
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  for(let i=0;i<users.length;i++){
    if(users[i].email===req.body.email){
      var d = new Date(Date.now());
      users[i].time=d.toString();
      break;
    }
  }
  next()
}
app.listen(3000)