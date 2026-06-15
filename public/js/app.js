document.addEventListener('DOMContentLoaded', () => {
  // Auto-dismiss flash alerts
  document.querySelectorAll('.alert[data-auto-dismiss]').forEach((el) => {
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 5000);
  });

  // Agendar: toggle online/presencial fields
  const typeRadios = document.querySelectorAll('input[name="type"]');
  const onlineFields = document.getElementById('online-fields');
  const presencialFields = document.getElementById('presencial-fields');

  function updateTypeFields() {
    const selected = document.querySelector('input[name="type"]:checked');
    if (!selected || !onlineFields || !presencialFields) return;

    const isOnline = selected.value === 'ONLINE';
    onlineFields.classList.toggle('hidden', !isOnline);
    presencialFields.classList.toggle('hidden', isOnline);

    const linkInput = onlineFields.querySelector('input');
    const locInput = presencialFields.querySelector('input');
    if (linkInput) linkInput.required = isOnline;
    if (locInput) locInput.required = !isOnline;
  }

  typeRadios.forEach((r) => r.addEventListener('change', updateTypeFields));
  updateTypeFields();

  // Confirm destructive actions
  document.querySelectorAll('form').forEach((form) => {
    const btn = form.querySelector('[data-confirm]');
    if (!btn) return;
    form.addEventListener('submit', (e) => {
      if (!confirm(btn.dataset.confirm)) e.preventDefault();
    });
  });
});

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
