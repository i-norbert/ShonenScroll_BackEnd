const express = require("express");
const router = express.Router();
const friendController = require("./friendMethods");

router.post("/request", friendController.sendRequest);
router.post("/accept", friendController.acceptRequest);
router.post("/decline", friendController.declineRequest);
router.get("/list/:userId", friendController.getFriends);
router.get("/pending/:userId", friendController.getPending);
router.post("/delete", friendController.deleteFriend);
router.get("/sent/:userId", friendController.getSent);


module.exports = router;
