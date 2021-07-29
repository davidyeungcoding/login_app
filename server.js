const express = require('express');
const path = require ('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');

mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
  console.log(`Connected to Database ${config.database}`);
})

mongoose.connection.on('error', err => {
  console.log(`Database Error: ${err}`);
})

const app = express();
const port = process.env.PORT || 8080;
const users = require('./routes/users');

app.use(cors());
app.use(express.static('./dist/login-app'));
app.use(bodyParser.urlencoded({
  limit: '2mb',
  extended: false
}))
app.use(bodyParser.json({limit: '2mb'}));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);

app.get('/*', (req, res) => {
  res.sendFile('index.html', {root: 'dist/login-app/'});
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})
