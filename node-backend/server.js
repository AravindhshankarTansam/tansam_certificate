require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const authRoutes = require('./routes/auth.routes');
const labRoutes = require('./routes/admin/master-table/labs.routes');
const teamLeadsRoutes = require('./routes/admin/master-table/teamLeads.routes');
const certificateRoutes = require('./routes/admin/master-table/certificate-signature.routes');
const roleRoutes = require('./routes/admin/master-table/roles.routes');
const userRoutes = require('./routes/admin/master-table/users.routes');
const holidayRoutes = require('./routes/admin/master-table/holidays.routes');

// Sub admin
const sdpRoutes = require('./routes/subadmin/sdp.routes');
const fdpRoutes = require('./routes/subadmin/fdp.routes');
const industryRoutes = require('./routes/subadmin/industry.routes');
// Finance
const financePaymentRoutes = require('./routes/finance/payment.routes');
const financeListRoutes = require('./routes/finance/list.routes');




const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

/* ✅ MySQL session store */
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

/* ✅ session middleware */
app.use(session({
  key: 'tansam.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 86400000
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/admin/master-table/labs', labRoutes);
app.use('/api/admin/master-table/team-leads', teamLeadsRoutes);
app.use('/api/admin/master-table/certificate-signature', certificateRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/admin/master-table/roles', roleRoutes);
app.use('/api/admin/master-table/users', userRoutes);
app.use('/api/admin/master-table/holidays', holidayRoutes);

// Sub admin
app.use('/api/subadmin/sdp', sdpRoutes);
app.use('/api/subadmin/fdp', fdpRoutes);
app.use('/api/subadmin/industry', industryRoutes);
// Finance
app.use('/api/finance/payment', financePaymentRoutes);
app.use('/api/finance', financeListRoutes);


const PORT = process.env.PORT || 5055;

app.listen(PORT, () =>
  console.log(`.....>>>>> Server running on http://localhost:${PORT} <<<<<<.....`)
);
