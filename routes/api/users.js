const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

const validateRegisterInput = require("../../validations/register");
const validateLoginInput = require("../../validations/login");

const User = require("../../Model/users").User;

router.post("/signup", (req, res) => {
  console.log("signup")
  const { message, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(200).json({ message: message, success: false });
  }

  const { email, password } = req.body;

  User.findOne({ email: email }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (!user) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.log(err);
          } else {
            const newUser = new User({
              email: email,
              password: hashedPassword,
              expenses: [],
            });

            newUser
              .save()
              .then((doc) => {
                console.log(doc);
                res.json({ success: true, doc: doc });
              })
              .catch((err) => {
                console.log(err);
              });
          }
        });
      } else {
        res
          .status(200)
          .json({ message: { email: "Email not available" }, success: false });
      }
    }
  });
});

router.post("/login", (req, res) => {
  const { message, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(200).json(message);
  }
  console.log("hi")
  const { email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      if (!user) {
        res.status(200).json({ message: "Please signup first" });
      } else {
        bcrypt.compare(password, user.password, (err, same) => {
          if (err) {
            console.log(err);
          } else {
            if (same) {
              const payload = {
                id: user._id,
                email: user.email,
              };

              jwt.sign(
                payload,
                keys.secretOrKey,
                {
                  expiresIn: 31556926,
                },
                (err, token) => {
                  res.json({
                    success: true,
                    token: "Bearer " + token,
                  });
                }
              );
            } else {
              res.status(200).json({ message: "Incorrect Email/Password" });
            }
          }
        });
      }
    }
  });
});

router.get("/verify", (req, res) => {
  let token = req["headers"].jwttoken;
  token = token.split(" ")[1];
  let decoded = jwt.decode(token, { json: true });
  console.log(decoded);
  if (!decoded) {
    res.send({ userAuthenticated: false });
  } else {
    let email = decoded.email;
    User.findOne({ email: email })
      .then((doc) => {
        if (!doc) {
          res.send({
            userAuthenticated: false,
          });
        } else {
          console.log(doc);
          res.send({
            userAuthenticated: true,
            user: {
              email: doc.email,
              id: doc._id,
            },
          });
        }
      })
      .catch((err) => {
        res.send({ message: "someError occured" });
      });
  }
});

module.exports = router;
