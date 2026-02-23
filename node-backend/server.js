require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const MySQLStore = require('express-mysql-session')(session);
const app = express();

/* ======================================================
   BASIC HARDENING
====================================================== */

app.disable('x-powered-by'); // hide express fingerprint
app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
); // security headers
app.use(compression()); // gzip
app.use(express.json({ limit: '10kb' })); // prevent big payload attacks
app.use(morgan('dev')); // logs

/* ======================================================
   RATE LIMITING
====================================================== */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});

app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

/* ======================================================
  CORS (Whitelist from .env)
====================================================== */

const allowedOrigins = process.env.CORS_ORIGINS.split(',');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true
}));

/* ======================================================
   SESSION STORE (MySQL)
====================================================== */

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.use(session({
  name: 'tansam.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite:'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

/* ======================================================
   ROUTES
====================================================== */
const { isAuth } = require('./middleware/auth.middleware');
const authRoutes = require('./routes/auth.routes');
const labRoutes = require('./routes/admin/master-table/labs.routes');
const teamLeadsRoutes = require('./routes/admin/master-table/teamLeads.routes');
const certificateRoutes = require('./routes/admin/master-table/certificate-signature.routes');
const roleRoutes = require('./routes/admin/master-table/roles.routes');
const userRoutes = require('./routes/admin/master-table/users.routes');
const holidayRoutes = require('./routes/admin/master-table/holidays.routes');
const sdpRoutes = require('./routes/subadmin/sdp.routes');
const fdpRoutes = require('./routes/subadmin/fdp.routes');
const industryRoutes = require('./routes/subadmin/industry.routes');
const ivRoutes = require('./routes/subadmin/iv.routes');
const financePaymentRoutes = require('./routes/finance/payment.routes');
const financeListRoutes = require('./routes/finance/list.routes');
const teamLeadRoutes = require('./routes/teamlead/teamlead.routes');
const certificateAccessRoutes = require('./routes/certificateAccess.routes');
const sdpBulkRoutes = require('./routes/subadmin/sdp_bulk.routes');
const fdpBulkRoutes = require('./routes/subadmin/fdp_bulk.routes');

app.use('/api/auth', authRoutes);
app.use('/api/admin/master-table/labs', labRoutes);
app.use('/api/admin/master-table/team-leads', teamLeadsRoutes);
app.use('/api/admin/master-table/certificate-signature', certificateRoutes);
app.use('/api/admin/master-table/roles', roleRoutes);
app.use('/api/admin/master-table/users', userRoutes);
app.use('/api/admin/master-table/holidays', holidayRoutes);
app.use('/api/subadmin/sdp', sdpRoutes);
app.use('/api/subadmin/fdp', fdpRoutes);
app.use('/api/subadmin/industry', industryRoutes);
app.use('/api/finance/payment', financePaymentRoutes);
app.use('/api/finance', financeListRoutes);
app.use('/api/teamlead', teamLeadRoutes);
app.use('/api/teamlead/holidays', holidayRoutes);
app.use('/api/certificate', require('./routes/certificate.routes'));
app.use('/api/iv', ivRoutes);
app.use('/api/certificate-access', certificateAccessRoutes);
app.use('/api/subadmin/sdp/bulk', sdpBulkRoutes);
app.use('/api/subadmin/fdp/bulk', fdpBulkRoutes);

/* ======================================================
 PROTECTED STATIC FILES
====================================================== */
app.use('/uploads', isAuth, express.static('uploads'));


// app.use('/images', express.static('public/images'));

/* ======================================================
   GLOBAL ERROR HANDLER
====================================================== */

app.use((err, req, res, next) => {
  // console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

/* ======================================================
   START SERVER
====================================================== */

const PORT = process.env.PORT || 5055;

app.listen(PORT, () =>
  console.log(`***Server running on port ${PORT}`)
);
