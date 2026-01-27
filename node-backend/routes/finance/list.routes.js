const router = require('express').Router();
const db = require('../../db');
const { isLoggedIn, allowRoles } = require('../../middleware/role.middleware');


/* ================= SDP LIST ================= */
router.get('/sdp',
  isLoggedIn,
  allowRoles('Finance'),
  async (req, res) => {

    const [rows] = await db.query(`
      SELECT s.*, l.name AS lab_name
      FROM sdp_students s
      LEFT JOIN labs l ON l.id = s.lab_id
      ORDER BY s.id DESC
    `);

    res.json(rows);
});


/* ================= FDP LIST ================= */
router.get('/fdp',
  isLoggedIn,
  allowRoles('Finance'),
  async (req, res) => {

    const [rows] = await db.query(`
      SELECT f.*, l.name AS lab_name
      FROM fdp_staff f
      LEFT JOIN labs l ON l.id = f.lab_id
      ORDER BY f.id DESC
    `);

    res.json(rows);
});


/* ================= INDUSTRY LIST ================= */
router.get('/industry',
  isLoggedIn,
  allowRoles('Finance'),
  async (req, res) => {

    const [rows] = await db.query(`
      SELECT i.*, l.name AS lab_name
      FROM industry_staff i
      LEFT JOIN labs l ON l.id = i.lab_id
      ORDER BY i.id DESC
    `);

    res.json(rows);
});

module.exports = router;
