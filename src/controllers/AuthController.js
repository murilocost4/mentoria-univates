const { loginUser } = require('../services/auth');
const { setFlash } = require('../middleware/auth');

function showLogin(req, res) {
  res.render('auth/login', { erro: null, email: '', requireTerms: false });
}

async function doLogin(req, res) {
  const { email, name, accept_terms } = req.body;
  const acceptTerms = accept_terms === 'on' || accept_terms === 'true';

  const result = await loginUser(email, name, { acceptTerms });

  if (result.error) {
    return res.render('auth/login', {
      erro: result.error,
      email: email || '',
      requireTerms: result.requireTerms ?? false,
    });
  }

  const { user } = result;
  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.role = user.role;
  req.session.name = user.name;

  if (user.role === 'ADMIN') return res.redirect('/admin/mentores');
  if (user.role === 'MENTOR') return res.redirect('/mentor/solicitacoes');
  return res.redirect('/mentores');
}

function logout(req, res) {
  req.session = null;
  res.redirect('/login');
}

function home(req, res) {
  const role = req.session.role;
  if (role === 'ADMIN') return res.redirect('/admin/mentores');
  if (role === 'MENTOR') return res.redirect('/mentor/solicitacoes');
  return res.redirect('/mentores');
}

module.exports = { showLogin, doLogin, logout, home };
