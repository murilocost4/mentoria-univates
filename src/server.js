require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const { initDatabase } = require('./config/database');
const { requireAuth, getFlash } = require('./middleware/auth');
const AuthController = require('./controllers/AuthController');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const mentoresRoutes = require('./routes/mentores');
const mentorRoutes = require('./routes/mentor');
const mentoriasRoutes = require('./routes/mentorias');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: Number(process.env.SESSION_MAX_AGE_MS || 86400000),
    httpOnly: true,
  },
}));

app.use((req, res, next) => {
  res.locals.user = req.session.userId
    ? {
        id: req.session.userId,
        email: req.session.email,
        name: req.session.name,
        role: req.session.role,
      }
    : null;
  res.locals.flash = getFlash(req);
  next();
});

app.use(authRoutes);

app.get('/', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  AuthController.home(req, res);
});

app.use(requireAuth);
app.use(profileRoutes);
app.use(mentoresRoutes);
app.use(mentorRoutes);
app.use(mentoriasRoutes);
app.use(adminRoutes);

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).send('Erro interno do servidor.');
});

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    const usingTurso = Boolean(process.env.TURSO_DATABASE_URL);
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Banco: ${usingTurso ? 'Turso (remoto)' : 'SQLite local (database/app.db)'}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Falha ao iniciar:', err);
    process.exit(1);
  });
}

module.exports = app;
