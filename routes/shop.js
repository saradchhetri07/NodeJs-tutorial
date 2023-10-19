const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, shopController.getIndex);

router.get("/products", isAuth, shopController.getProducts);

router.get("/products/:productId", isAuth, shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.get("/orders", isAuth, shopController.getOrders);

// // router.get("/checkout", shopController.getCheckout);

router.post("/cart-delete-item", isAuth, shopController.deleteCartItem);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

router.get("/checkout/cancel", isAuth, shopController.getCheckout);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
