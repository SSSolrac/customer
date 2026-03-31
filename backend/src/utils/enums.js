const ORDER_STATUS = ["pending", "preparing", "ready", "out_for_delivery", "completed", "delivered", "cancelled", "refunded"];
const PAYMENT_METHOD = ["qrph", "gcash", "maribank", "bdo"];
const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"];
const ORDER_TYPE = ["dine_in", "pickup", "takeout", "delivery"];

module.exports = { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, ORDER_TYPE };
