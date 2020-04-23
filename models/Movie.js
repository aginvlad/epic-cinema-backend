const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genres: {
    type: Array,
    required: true
  },
  posterUrl: {
    type: String,
    default: ''
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    }
  ]
});

const Movie = (module.exports = mongoose.model('Movie', MovieSchema));

module.exports.addMovie = (movieData) => {
  const newMovie = new Movie(movieData);
  return newMovie.save();
};

module.exports.editMovie = (newData) => {
  return Movie.findByIdAndUpdate(newData._id, newData, { new: true, useFindAndModify: false });
};

module.exports.deleteMovie = movieId => {
  return Movie.findByIdAndRemove(movieId);
};

module.exports.updateSessions = (session, movieId) => {
  return Movie.findById(movieId)
    .then(movie => {
      movie.sessions.push(session._id);
      return movie.save();
    });
};

module.exports.deleteSession = session => {
  return Movie.findOne({sessions: session._id})
    .then(movie => {
      movie.sessions.splice(movie.sessions.indexOf(session._id), 1);
      return movie.save();
    });
};

module.exports.getMoviesList = () => {
  return Movie.find({}, [
    'title',
    'price',
    'posterUrl',
    'description',
    'trailerUrl',
    'genres'
  ]);
};