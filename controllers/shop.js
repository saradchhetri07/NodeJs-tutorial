const Cart = require("../models/cart");
const Product = require("../models/product");
const user = require("../models/user");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(
  "sk_test_51O2dODSBEZ9vIglMf23xsLUeuAhRvpJYu9DUrrSCaABs4gsU5RrX37Ga91D4FRgHIlJMjQRpWDKz0vOy2qzjLIUv00ys2V2FNB"
);
const ITEMS_PER_PAGE = 1;
const PDFDocument = require("pdfKit");

exports.getProducts = (req, res, next) => {
  let page = +req.query.page;
  if (Number.isNaN(Number(page))) {
    page = 1;
  }
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find({ userId: req.user._id })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      console.log("products");
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All products",
        path: "/products",
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
      if (product.userId !== req.user._id) {
        return res.redirect("/");
      }
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
  let page = +req.query.page;
  if (Number.isNaN(Number(page))) {
    page = 1;
  }
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      console.log("products");
      res.render("shop/index", {
        prods: products,
        pageTitle: "products",
        path: "/",
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        currentPage: page,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your cart",
        products: products,
        addCart: req.flash("add-cart"),
        saveOrder: req.flash("save-order"),
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      const transformedItems = products.map((p) => ({
        quantity: p.quantity,
        price_data: {
          currency: "usd",
          unit_amount: p.productId.price * 100,
          product_data: {
            name: p.productId.title,
            description: p.productId.description,
          },
        },
      }));

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: transformedItems,
        mode: "payment",
        // products.map((p) => {
        //   return {
        //     name: p.productId.title,
        //     description: p.productId.description,
        //     amount: p.productId.price * 100,
        //     currency: "usd",
        //     quantity: p.quantity,
        //   };
        // }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((newuser) => {
      const products = newuser.cart.items.map((i) => {
        return { Quantity: i.quantity, productData: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      req.flash("save-order", "orders saved!");
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getOrders = (req, res, next) => {
  return Order.find({ "user.userId": req.user._id })
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
  return req.session.user.removeFromCart(prodId).then((result) => {
    res.redirect("/cart");
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      console.log("postcart" + product.title);
      req.user.addToCart(product);
      req.flash("add-cart", "Items added sucessfully");
      res.redirect("/cart");
    })
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("Order not found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Not authorized"));
      }

      const invoiceName = "Invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.Quantity * prod.productData.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.productData.title +
              " - " +
              prod.Quantity +
              "* " +
              prod.productData.price
          );
      });
      pdfDoc.fontSize(14).text("TotalPrice=" + totalPrice);
      // pdfDoc.text("hello world");
      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });

      //const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch((err) => {
      return next(new Error(err.message));
    });
};
