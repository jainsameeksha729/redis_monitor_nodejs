const express = require("express");

const controller = require("../../controller/redis.controller");
const auth = require("../../middlewares/auth");
const router = express.Router();

router.route("/list").get(controller.list);
router.route("/info").get(controller.info);
router.route("/monitor").get(controller.monitor);
router.route("/ping").get(controller.ping);
router.route("/add").post(controller.add);
router.route("/del").post(controller.del);
router.route("/flushAll").post(controller.flushAll);

module.exports = router;