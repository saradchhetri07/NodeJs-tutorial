const user = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { createTransport } = require("nodemailer");
const myusername = process.env.SMTP_USERNAME;
const SMTPkey =
  "xsmtpsib-b9343d3c64431902f87f8c9c3a7e94aa0bbecfeab2f18fd03a6a4d494c5e0a2b-dZK20xFs9pYWQJ47";
const { validationResult } = require("express-validator");

const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "sangamkshettry99999@gmail.com",
    pass: SMTPkey,
  },
});

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
    signUp: req.flash("sign-Up"),
    validationErrors: [],
    oldInput: {
      email: "",
      password: "",
    },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      signUp: req.flash("sign-Up"),
      validationErrors: errors.array(),
      oldInput: {
        email: email,
        password: password,
      },
    });
  }
  user.findOne({ email: email }).then((foundUser) => {
    if (!foundUser) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }
    bcrypt
      .compare(password, foundUser.password)
      .then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = foundUser;
          return res.redirect("/");
          //   return res.session.save((err) => {
          //     console.log(err);

          //   });
        } else {
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        }
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.postLogOut = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getsignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signUp",
    pageTitle: "SignUp",
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postsignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signUp",
      pageTitle: "SignUp",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const User = new user({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      req.flash("sign-Up", "User created successfully");
      return User.save();
    })
    .then((result) => {
      res.redirect("/login");

      const mailOptions = {
        from: "sangamkshettry99999@gmail.com",
        to: email,
        subject: `SignUp suceeded`,
        text: `<h1>You sucessfully signed up!</h1>`,
      };

      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error("Error:", error);
        }
        console.log("Email sent:", info.response);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset password",
    errorMessage: req.flash("error"),
    signUp: req.flash("sign-Up"),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");

    user
      .findOne({ email: req.body.email })
      .then((foundUser) => {
        if (!foundUser) {
          req.flash("error", "No Account with that email found");
          return res.redirect("/reset");
        }
        foundUser.resetToken = token;
        foundUser.resetTokenExpires = Date.now() + 3600000;
        return foundUser.save();
      })
      .then((result) => {
        res.redirect("/");
        const mailOptions = {
          from: "sangamkshettry99999@gmail.com",
          to: req.body.email,
          subject: `password reset`,
          html: `
          <p>you requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a></p>
          `,
        };

        return transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.error("Error:", error);
          }
          console.log("Email sent:", info.response);
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  user
    .findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } })
    .then((foundUser) => {
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Reset password",
        errorMessage: req.flash("error"),
        userId: foundUser._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  user
    .findOne({
      resetToken: passwordToken,
      resetTokenExpires: { $gt: Date.now() },
      _id: userId,
    })
    .then((foundUser) => {
      resetUser = foundUser;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
