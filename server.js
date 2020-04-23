const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

app.use(cors());
// Body Parser Middleware
app.use(express.json());

// Passport
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB contected...'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/movies', require('./routes/api/movies'));

const port = 8000;

app.listen(port, () => console.log(`Server started on port ${port}`));
