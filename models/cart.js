// const { createSecretKey } = require("crypto");
// const fs = require("fs");
// const path = require("path");

// // const p = path.join(
// //   path.dirname(process.mainModule.filename),
// //   "data",
// //   "carts.json"
// // );

// // const getProductsFromFile = (cb) => {
// //   fs.readFile(p, (err, fileContent) => {
// //     if (err) {
// //       cb([]);
// //     } else {
// //       cb(JSON.parse(fileContent));
// //     }
// //   });
// // };

// module.exports = class Cart {
//   // static deleteProduct(id, productPrice) {
//   //   fs.readFile(p, (err, fileContent) => {
//   //     if (err) {
//   //       return;
//   //     }
//   //     const updatedCart = { ...JSON.parse(fileContent) };
//   //     const product = updatedCart.products.find((p) => p.id === id);
//   //     if (!product) {
//   //       return;
//   //     }
//   //     const productQty = product.qty;
//   //     updatedCart.products = updatedCart.products.filter(
//   //       (prod) => prod.id !== id
//   //     );
//   //     updatedCart.totalPrice =
//   //       updatedCart.totalPrice - productQty * productPrice;

//   //     fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
//   //       console.log(err);
//   //     });
//   //   });
//   // }

//   static addToCart(id, productPrice) {
//     //check if product exists
//     fs.readFile(p, (err, fileContent) => {
//       let cart = { products: [], totalPrice: 0 };
//       if (!err) {
//         cart = JSON.parse(fileContent);
//       }
//       //analyze the cart and find the existing product
//       const existingProductIndex = cart.products.findIndex(
//         (prod) => prod.id === id
//       );
//       console.log(existingProductIndex);
//       const existingProduct = cart.products[existingProductIndex];

//       let updatedProduct;

//       if (existingProduct) {
//         updatedProduct = { ...existingProduct };
//         updatedProduct.qty = updatedProduct.qty + 1;
//         cart.products = [...cart.products];
//         cart.products[existingProductIndex] = updatedProduct;
//       } else {
//         updatedProduct = { id: id, qty: 1 };
//         cart.products = [...cart.products, updatedProduct];
//       }
//       cart.totalPrice = parseInt(cart.totalPrice) + parseInt(productPrice);
//       fs.writeFile(p, JSON.stringify(cart), (err) => {
//         console.log(err);
//       });
//     });
//   }

//   static fetchAll(cb) {
//     getProductsFromFile(cb);
//   }
// };
