const Cart = require("../models/cart");
const Product = require("../models/product");
const user = require("../models/user");

exports.getProducts = (req, res, next) => {
  const products = Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log("from get product" + product.title);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "products",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  return req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your cart",
        products: products,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.createrOrder = (req, res, next) => {
  return req.user
    .addOrder()
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getOrders = (req, res, next) => {
  return req.user
    .getCartOrders()
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  return req.user.deleteProductFromCart(prodId).then((result) => {
    res.redirect("/cart");
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log("postcart" + product.title);
      req.user.addToCart(product);
      res.redirect("/cart");
      // res.render("shop/cart", {
      //   productId: prodId,
      //   path: "/cart",
      //   pageTitle: "Your Cart",
      // });
    })
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
