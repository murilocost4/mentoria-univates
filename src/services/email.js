const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter !== null) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

async function sendEmail({ to, subject, body }) {
  const mailFrom = process.env.MAIL_FROM || 'mentoria@universo.univates.br';
  const transport = getTransporter();

  if (!transport) {
    console.log('[EMAIL MOCK]', { to, subject, body });
    return;
  }

  await transport.sendMail({
    from: mailFrom,
    to,
    subject,
    text: body,
  });
}

function formatMentorshipDetails(mentorship) {
  const lines = [];
  if (mentorship.type === 'ONLINE') {
    lines.push('Tipo: Online');
    if (mentorship.meeting_link) lines.push(`Link: ${mentorship.meeting_link}`);
  } else if (mentorship.type === 'PRESENCIAL') {
    lines.push('Tipo: Presencial');
    if (mentorship.location) lines.push(`Local: ${mentorship.location}`);
  }
  if (mentorship.scheduled_at) {
    lines.push(`Data/hora: ${mentorship.scheduled_at}`);
  }
  return lines.join('\n');
}

async function notifyNewRequest(mentorEmail, studentName, discipline) {
  await sendEmail({
    to: mentorEmail,
    subject: 'Nova solicitação de mentoria',
    body: `Olá,\n\n${studentName} enviou uma nova solicitação de mentoria em ${discipline}.\n\nAcesse o sistema para aceitar ou recusar.`,
  });
}

async function notifyRequestDecision(studentEmail, accepted, mentorName) {
  await sendEmail({
    to: studentEmail,
    subject: accepted ? 'Solicitação aceita' : 'Solicitação recusada',
    body: accepted
      ? `Sua solicitação de mentoria com ${mentorName} foi aceita. Aguarde o agendamento.`
      : `Sua solicitação de mentoria com ${mentorName} foi recusada.`,
  });
}

async function notifyScheduled(studentEmail, mentorEmail, mentorship) {
  const details = formatMentorshipDetails(mentorship);
  const body = `Mentoria agendada.\n\n${details}`;
  await sendEmail({ to: studentEmail, subject: 'Mentoria agendada', body });
  await sendEmail({ to: mentorEmail, subject: 'Mentoria agendada', body });
}

async function notifyCancelled(studentEmail, mentorEmail, mentorship, cancelledByName) {
  const details = formatMentorshipDetails(mentorship);
  const reason = mentorship.cancel_reason ? `\nMotivo: ${mentorship.cancel_reason}` : '';
  const body = `Mentoria cancelada por ${cancelledByName}.\n\n${details}${reason}`;
  await sendEmail({ to: studentEmail, subject: 'Mentoria cancelada', body });
  await sendEmail({ to: mentorEmail, subject: 'Mentoria cancelada', body });
}

async function notifyMentorApproval(mentorEmail, approved) {
  await sendEmail({
    to: mentorEmail,
    subject: approved ? 'Cadastro de mentor aprovado' : 'Cadastro de mentor reprovado',
    body: approved
      ? 'Seu cadastro de mentor foi aprovado. Você já está visível na busca de mentores.'
      : 'Seu cadastro de mentor foi reprovado. Entre em contato com a administração para mais informações.',
  });
}

async function notifyReviewRequest(studentEmail, mentorshipId) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  await sendEmail({
    to: studentEmail,
    subject: 'Avalie sua mentoria',
    body: `Sua mentoria foi concluída. Por favor, avalie seu mentor:\n${baseUrl}/historico\n\nMentoria #${mentorshipId}`,
  });
}

module.exports = {
  sendEmail,
  notifyNewRequest,
  notifyRequestDecision,
  notifyScheduled,
  notifyCancelled,
  notifyMentorApproval,
  notifyReviewRequest,
};
