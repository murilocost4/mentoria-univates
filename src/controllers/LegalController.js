function termos(req, res) {
  res.render('legal/termos', { title: 'Termos de Uso' });
}

function privacidade(req, res) {
  res.render('legal/privacidade', { title: 'Política de Privacidade' });
}

function conduta(req, res) {
  res.render('legal/conduta', { title: 'Regras de Conduta' });
}

module.exports = { termos, privacidade, conduta };
