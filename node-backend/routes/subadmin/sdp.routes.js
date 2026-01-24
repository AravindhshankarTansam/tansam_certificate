const express = require('express');
const router = express.Router();

/* ================= CONTROLLER ================= */
const sdpController = require('../../controllers/subadminController/sdp.controller');

/* ================= MIDDLEWARE ================= */
const { isAuth } = require('../../middleware/auth.middleware');
const { isSubAdmin } = require('../../middleware/role.middleware');


/* =================================================
   SDP ROUTES (SUB ADMIN ONLY)
================================================= */

/* ---------- GET ALL SDP STUDENTS ---------- */
router.get(
  '/get',
  isAuth,
  isSubAdmin,
  sdpController.getAll
);


/* ---------- ADD NEW SDP ---------- */
router.post(
  '/post',
  isAuth,
  isSubAdmin,
  sdpController.add
);


/* ---------- UPDATE SDP ---------- */
router.put(
  '/update/:id',
  isAuth,
  isSubAdmin,
  sdpController.update
);

module.exports = router;
