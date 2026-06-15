function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session.userId) {
    const role = req.session.role;
    if (role === 'ADMIN') return res.redirect('/admin/mentores');
    if (role === 'MENTOR') return res.redirect('/mentor/solicitacoes');
    return res.redirect('/mentores');
  }
  next();
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function getFlash(req) {
  const flash = req.session.flash;
  delete req.session.flash;
  return flash;
}

module.exports = { requireAuth, requireGuest, setFlash, getFlash };
