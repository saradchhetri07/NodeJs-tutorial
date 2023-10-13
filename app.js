const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

// const mongoConnect = require("./util/database").mongoConnect;

const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const User = require("./models/user");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("6527eff636c292981d54ecf1")
    .then((user) => {
      console.log(user);
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// rs
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://saradchhetri20690:pepsodent123@cluster0.bfx60q2.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const newuser = new User({
          name: "Sarad",
          email: "saradchhetri20690@gmail.com",
          cart: {
            items: [],
          },
        });
        newuser.save();
      }
    });

    console.log("database connected");
    app.listen(3000);
  })
  .catch((error) => {
    console.log(error);
  });
