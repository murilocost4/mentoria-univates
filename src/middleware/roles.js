const { setFlash } = require('./auth');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.role)) {
      setFlash(req, 'erro', 'Você não tem permissão para acessar esta página.');
      return res.redirect('/');
    }
    next();
  };
}

module.exports = { requireRole };
