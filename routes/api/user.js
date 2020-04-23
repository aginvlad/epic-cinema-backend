const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../../models/User');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const verifyUser = require('../../config/verifyUser');
const config = require('../../config/keys');

router.post('/sign-up', (req, res) => {
  const { name, phone, password } = req.body;
  const newUser = new User({
    name,
    phone,
    password
  });

  User.getUserByPhone(phone, (err, user) => {
    if (err) res.status(500);
    if (user) {
      res.status(400).send({ error: 'User already exsists' });
      return;
    }
    User.addUser(newUser, (err, user) => {
      if (err) res.status(400).send({ msg: "User wasn't added" });
      else {
        const token = jwt.sign(user.toJSON(), config.secret, {
          expiresIn: 3600
        });
        res.json({ user, token });
      }
    });
  });
});

router.post('/sign-in', (req, res) => {
  const { phone, password } = req.body;

  User.getUserByPhone(phone, (err, user) => {
    if (err) throw err;
    if (!user) return res.status(403).send({ msg: 'Wrong login or password' });

    User.comparePass(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(user.toJSON(), config.secret, {
          expiresIn: 3600
        });

        const { name, isAdmin } = user;
        res.json({
          success: true,
          token: token,
          user: {
            name,
            isAdmin
          }
        });
      } else return res.status(403).send({ msg: 'Wrong login or password' });
    });
  });
});

router.post(
  '/update',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) res.status(401).send('unauthorized');
    const { _id } = user;

    const newData = {};

    if (req.body.name) {
      newData.name = req.body.name;
    }

    if (req.body.password) {
      if (req.body.name) {
        newData.name = req.body.name;
      }
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) throw err;
          newData.password = hash;
          User.updateUser(_id, newData, (err, updatedUser) => {
            const { name, isAdmin } = updatedUser;
            res.json({ name, isAdmin });
          });
        });
      });
    } else {
      if (req.body.name) {
        newData.name = req.body.name;
      }
      if (!Object.entries(newData).length) {
        res.status(500);
        return;
      }
      User.updateUser(_id, newData, (err, updatedUser) => {
        const { name, isAdmin } = updatedUser;
        res.json({ name, isAdmin });
      });
    }
  }
);

router.get(
  '/get-current-user',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const user = verifyUser(req);
    if (!user) res.status(401).send('unauthorized');

    User.getUserById(user._id, (err, user) => {
      if (err) return res.status(401).send('unauthorized');
      const { name, isAdmin } = user;
      res.json({ name, isAdmin });
    });
  }
);

module.exports = router;
