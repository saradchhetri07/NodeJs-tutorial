const express = require("express");
const { check, body } = require("express-validator");
const authController = require("../controllers/auth");
const router = express.Router();
const user = require("../models/user");
router.get("/login", authController.getLogin);

router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({
        min: 5,
      })
      .withMessage("Please enter a valid password"),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogOut);

router.get("/signup", authController.getsignUp);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        // if (value === "text@test.com") {
        //   throw new Error("This email address is forbidden");
        // }
        // return true;
        return user.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email exists already, please pick a different one"
            );
          }
        });
      }),
    body(
      "password",
      "please enter a password with only numbers and text and at least 5 characters and at max 10"
    )
      .trim()
      .isLength({
        min: 5,
      })
      .isAlphanumeric(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password has to match");
        }
        return true;
      }),
  ],
  authController.postsignUp
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
