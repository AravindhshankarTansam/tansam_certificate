require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const authRoutes = require('./routes/auth.routes');
const labRoutes = require('./routes/admin/master-table/labs.routes');


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


const PORT = process.env.PORT || 5055;

app.listen(PORT, () =>
  console.log(`.....>>>>> Server running on http://localhost:${PORT} <<<<<<.....`)
);
