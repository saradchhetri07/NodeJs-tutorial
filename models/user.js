const mongoose = require("mongoose");
const Product = require("./product");
const Schema = mongoose.Schema;
const Order = require("./order");
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.removeFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== prodId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.addOrder = function () {
  return this.getCart()
    .then((products) => {
      const order = {
        items: products,
        user: {
          _id: new mongodb.ObjectId(this._id),
          name: this.name,
        },
      };
      return db.collection("orders").insertOne(order);
    })
    .then((result) => {
      this.cart = { items: [] };
      return db.collection("users").updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        {
          $set: {
            cart: {
              items: [],
            },
          },
        }
      );
    });
};

//deleting entire cart upon order
userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

//     const db = getdb();

//     return db
//       .collection("orders")
//       .find({ "user._id": new mongodb.ObjectId(this._id) })
//       .toArray();
// userSchema.methods.getCart = function () {
//   //gives product IDs
//   const productIds = this.cart.items.map((p) => {
//     return p.productId;
//   });
//   return Product.find({ _id: { $in: productIds } }).then((products) => {
//     return products.map((p) => {
//       return {
//         ...p,
//         quantity: this.cart.items.find((i) => {
//           return p._id.toString() === i.productId.toString();
//         }).quantity,
//       };
//     });
//   });
// return db
//   .collection("products")
//   .find({ _id: { $in: productIds } })
//   .toArray()
//   .then((products) => {
//     return products.map((p) => {
//       return {
//         ...p,
//         quantity: this.cart.items.find((i) => {
//           return p._id.toString() === i.productId.toString();
//         }).quantity,
//       };
//     });
//   });
// };

module.exports = mongoose.model("User", userSchema);

// const mongodb = require("mongodb");

// const getdb = require("../util/database").getdb;

// class user {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; //{items:[]}
//     this._id = id;
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const db = getdb();

//     return db.collection("users").updateOne(
//       { _id: new mongodb.ObjectId(this._id) },
//       {
//         $set: {
//           cart: {
//             items: updatedCartItems,
//           },
//         },
//       }
//     );
//   }

//   deleteProductFromCart(prodId) {
//     const updatedCart = this.cart.items.filter((products) => {
//       return products.productId.toString() !== prodId.toString();
//     });
//     const db = getdb();

//     return db.collection("users").updateOne(
//       { _id: new mongodb.ObjectId(this._id) },
//       {
//         $set: {
//           cart: {
//             items: updatedCart,
//           },
//         },
//       }
//     );
//   }

//   addOrder() {
//     const db = getdb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new mongodb.ObjectId(this._id),
//             name: this.name,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db.collection("users").updateOne(
//           { _id: new mongodb.ObjectId(this._id) },
//           {
//             $set: {
//               cart: {
//                 items: [],
//               },
//             },
//           }
//         );
//       });
//   }

//   getCart() {
//     const db = getdb();

//     //gives product IDs
//     const productIds = this.cart.items.map((p) => {
//       return p.productId;
//     });
//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find((i) => {
//               return p._id.toString() === i.productId.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   save() {
//     const db = getdb();
//     let dbOp;

//     dbOp = db.collection("users").insertOne(this);
//     // }

//     return dbOp
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
//   //get orders details
//   getCartOrders() {
//     const db = getdb();

//     return db
//       .collection("orders")
//       .find({ "user._id": new mongodb.ObjectId(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getdb();
//     return db
//       .collection("users")
//       .findOne({ _id: new mongodb.ObjectId(userId) })
//       .then((user) => {
//         console.log(user);
//         return user;
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//     next();
//   }

//   static getCartItem(userId) {
//     const db = getdb();
//     return db.collection("users");
//   }
// }

// module.exports = user;
