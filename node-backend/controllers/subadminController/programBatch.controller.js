const db = require('../../db');

/* =====================================================
   BULK UPLOAD – SDP / FDP / INDUSTRY
===================================================== */
exports.bulkUploadBatch = async (req, res) => {
  try {

    const {
      program_type,           // SDP | FDP | INDUSTRY
      batch_name,
      organization_name,
      organization_short,
      from_date,
      to_date,
      created_by
    } = req.body;

    if (!program_type || !organization_name || !organization_short) {
      return res.status(400).json({
        message: 'Missing required fields'
      });
    }

    /* ================= SAVE EXCEL PATH ================= */
    const excelPath = req.file
      ? `batches/${program_type}/${organization_short}/${req.file.filename}`
      : null;

    /* ================= CREATE BATCH ================= */
    const [result] = await db.query(
      `
      INSERT INTO program_batches (
        program_type,
        batch_name,
        organization_name,
        organization_short,
        from_date,
        to_date,
        excel_file,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        program_type,
        batch_name,
        organization_name,
        organization_short,
        from_date,
        to_date,
        excelPath,
        created_by || null
      ]
    );

    res.json({
      message: 'Batch uploaded successfully',
      batch_id: result.insertId
    });

  } catch (err) {
    console.error('BULK UPLOAD ERROR:', err);
    res.status(500).json({
      message: 'Bulk upload failed'
    });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM program_batches
      ORDER BY id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to fetch batches'
    });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[batch]] = await db.query(`
      SELECT *
      FROM program_batches
      WHERE id = ?
    `, [id]);

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json(batch);

  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch batch'
    });
  }
};

