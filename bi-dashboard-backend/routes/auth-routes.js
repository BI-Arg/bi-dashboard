const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authUtils = require("../helpers/auth-helper");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const smtpConfig = {
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
};

const transporter = nodemailer.createTransport(smtpConfig)

authRouter.post("/signup", (req, res) => {

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);

  if (req.body.password.length < 8) {
    return res.status(400).json({
      error: {},
      message: "Your password is not long enough."
    })
  };

  if (!req.body.email.includes("@")) {
    return res.status(400).json({
      error: {},
      message: "Your email is not valid."
    })
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000); // genera un codigo random de 6 digitos
  const verificationCodeHash = bcrypt.hashSync(verificationCode.toString(), salt); // genera el hash del codigo para guardar en la DB
  const mailBody = `Hello, ${req.body.name}! This is your verification code: ${verificationCode}`

  transporter.sendMail({
    from: "sender",
    to: req.body.email,
    subject: "Verify your email",
    text: mailBody
  })

  User.create({
      ...req.body,
      password: hashedPassword,
      verificationCode: verificationCodeHash
    })
    .then(user => {
      req.user = user;
      jwt.sign({
          id: user._id
        },
        process.env.SECRET, {
          expiresIn: 86400
        },
        (err, token) => {
          delete user._doc.password;
          res.status(200).json({
            token,
            user
          });
        }
      );
    })
    .catch(err => {
      res.status(500).json({
        err,
        message: "There was an error creating your user."
      });
    });
});

authRouter.patch("/verify", (req, res) => {
  const {
    email,
    verificationCode
  } = req.body;

  User.findOne({
    email
  }).then(user => {

    if (!user) {
      return res.status(404).json({
        error: {},
        message: "Incorrect user"
      });
    }

    const verificationCodeIsValid = bcrypt.compareSync(verificationCode, user.verificationCode);
    if (!verificationCodeIsValid) {
      return res.status(401).json({
        error: {},
        message: "Incorrect verification code"
      });
    } else {
      User.findOneAndUpdate({
        _id: user.id
      }, {
        verified: true
      }).then(user => {
        
        if (!user) {
          return res.status(404).json({
            error: {},
            message: "Incorrect email address"
          });
        }

        jwt.sign({
            id: user._id
          },
          process.env.SECRET, {
            expiresIn: 86400
          },
          (err, token) => {
            delete user._doc.password;
            res.status(200).json({
              token,
              user
            });
          }
        );
      })
    }
  })
});

authRouter.post("/login", (req, res) => {
  const {
    email,
    password
  } = req.body;
  User.findOne({
    email
  }).then(user => {
    if (!user) {
      return res.status(404).json({
        error: {},
        message: "Incorrect email address"
      });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({
        error: {},
        message: "Incorrect password"
      });
    }

    jwt.sign({
        id: user._id
      },
      process.env.SECRET, {
        expiresIn: 86400
      },
      (err, token) => {
        delete user._doc.password;
        res.status(200).json({
          token,
          user
        });
      }
    );
  });
});

module.exports = authRouter;