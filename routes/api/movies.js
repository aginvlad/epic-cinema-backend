const express = require('express');
const router = express.Router();
const Movie = require('../../models/Movie');
const Session = require('../../models/Session');
const User = require('../../models/User');
const passport = require('passport');
const verifyUser = require('../../config/verifyUser');

/* FOR ADD SESIION 
 Movie.addMovie(req.body)
      .then(movie => Session.addSession(movie._id))
      .then(session => Movie.updateSessions(session))
      .then(movie => movie.populate('sessions').execPopulate())
      .then(result => res.json(result))
      .catch(err => res.status(500).send({ error: err.message }));
*/

router.post(
  '/add-movie',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) return res.status(401).send('unauthorized');
    if (!user.isAdmin) return res.status(403).send({ error: 'Not allowed' });

    Movie.addMovie(req.body)
      .then(result => res.json(result))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.post(
  '/edit-movie',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) return res.status(401).send('unauthorized');

    if (!user.isAdmin) return res.status(403).send({ error: 'Not allowed' });

    Movie.editMovie(req.body)
      .then(result => res.json({ success: true }))
      .catch(e => res.status(400).send({ err: 'Bad Request' }));
  }
);

router.post(
  '/delete-movie',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) return res.status(401).send('unauthorized');

    if (!user.isAdmin) return res.status(403).send({ error: 'Not allowed' });

    Movie.deleteMovie(req.body._id)
      .then(movie => {
        Promise.all(
          movie.sessions.map(sessionId => Session.deleteSession(sessionId))
        );
      })
      .then(result => res.json({ success: true }))
      .catch(e => res.status(400).send({ err: 'Bad Request' }));
  }
);

router.get('/', (req, res) => {
  Movie.getMoviesList()
    .then(movies => res.json(movies))
    .catch(e => res.status(404).send({ error: 'Not found' }));
});

router.post(
  '/add-session',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) return res.status(401).send('unauthorized');

    if (!user.isAdmin) return res.status(403).send({ error: 'Not allowed' });

    Session.addSession(req.body.session)
      .then(session => Movie.updateSessions(session, req.body.movieId))
      .then(result => res.json({ success: true }))
      .catch(e => res.status(400).send({ err: 'Bad Request' }));
  }
);

router.post('/get-movie-sessions', (req, res) => {
  const { movieId } = req.body;
  if (!movieId) {
    res.status(400).send({ error: 'Bad Request' });
    return;
  }
  Movie.findById(movieId)
    .then(movie => Session.getMovieSessions(movie.sessions))
    .then(sessions => {
      const filteredSessions = sessions.filter(el => {
        const dateParts = el.date.split('.');
        const timeParts = el.time.split(':');

        if (
          (dateParts[1] < new Date().getMonth() + 1 &&
            new Date().getMonth() + 1 !== 12) ||
          (dateParts[0] < new Date().getDate() &&
            +dateParts[1] === new Date().getMonth() + 1) ||
          (timeParts[0] <= new Date().getHours() &&
            +dateParts[0] === new Date().getDate() &&
            +dateParts[1] === new Date().getMonth() + 1)
        )
          return false;
        return true;
      });
      return res.json(filteredSessions);
    })
    .catch(e => res.status(404).send({ error: 'Not found' }));
});

router.post(
  '/get-all-movie-sessions',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) return res.status(401).send('unauthorized');

    if (!user.isAdmin) return res.status(403).send({ error: 'Not allowed' });

    const { movieId } = req.body;
    if (!movieId) {
      res.status(400).send({ error: 'Bad Request' });
      return;
    }
    Movie.findById(movieId)
      .then(movie => Session.getMovieSessions(movie.sessions))
      .then(sessions => res.json(sessions))
      .catch(e => res.status(404).send({ error: 'Not found' }));
  }
);

router.post(
  '/delete-session',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { sessionId } = req.body;
    const user = verifyUser(req);

    if (!user) return res.status(401).send('unauthorized');
    if (!user.isAdmin) return res.status(403).send({ error: 'Not allowed' });

    Session.deleteSession(sessionId)
      .then(session => Movie.deleteSession(session))
      .then(movies => res.json(movies))
      .catch(e => res.status(404).send({ error: 'Not found' }));
  }
);

router.post(
  '/book-places',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) return res.status(401).send('unauthorized');

    const { sessionId, places } = req.body;
    if (!sessionId || !places)
      return res.status(400).send({ error: 'Bad Request' });

    Session.bookPlaces(sessionId, places, user._id)
      .then(() => res.status(200).json({ success: true }))
      .catch(e => res.status(400).send({ error: 'Wrong Places!' }));
  }
);

module.exports = router;
