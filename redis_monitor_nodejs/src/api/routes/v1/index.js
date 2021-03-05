const express = require('express');
// const bootstrapRoutes = require('./bootstrap.route');
const jobRoute = require("./redis.route");
const router = express.Router();

/**
 * @swagger
 * /status:
 *  get:
 *    tags:
 *      - Status
 *    summary: Server health status
 *    responses:
 *        200:
 *          description: A successful response
 */
router.get('/status', (req, res) => res.send('OK'));

router.use("/redis", jobRoute);

// router.use("/search", searchRoute);

module.exports = router;
