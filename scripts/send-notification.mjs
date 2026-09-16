import webpush from 'web-push';

const VAPID_PUBLIC_KEY = 'BH3gqw9zuR6Gm10IrKmPARdFK_xwTh_E5lVhoorVvS4esEu8ID6SlcT4hc_ZNxZrUZA3nLV-3hnZmbuGKcbExrQ';
const VAPID_SUBJECT = 'mailto:no-reply@antuneslibano.github.io';

const { PUSH_SUBSCRIPTION, VAPID_PRIVATE_KEY } = process.env;

if (!PUSH_SUBSCRIPTION) {
  console.log('Nenhum PUSH_SUBSCRIPTION configurado ainda — nada para enviar.');
  process.exit(0);
}
if (!VAPID_PRIVATE_KEY) {
  console.error('VAPID_PRIVATE_KEY não configurado.');
  process.exit(1);
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const subscription = JSON.parse(PUSH_SUBSCRIPTION);

// The runner is UTC; Brazil (BRT) has been fixed at UTC-3 since DST ended in 2019.
const now = new Date();
const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const isSunday = brt.getUTCDay() === 0;
const tomorrow = new Date(brt.getTime() + 24 * 60 * 60 * 1000);
const isLastDayOfMonth = tomorrow.getUTCDate() === 1;

const parts = ['Suas missões diárias te esperam.'];
if (isSunday) parts.push('As semanais reiniciam hoje à noite — hora de fechar a semana.');
if (isLastDayOfMonth) parts.push('Último dia pra fechar as missões mensais!');

const payload = JSON.stringify({
  title: 'O Sistema chama, Caçador',
  body: parts.join(' '),
  url: '/App/',
});

try {
  await webpush.sendNotification(subscription, payload);
  console.log('Notificação enviada com sucesso.');
} catch (err) {
  console.error('Falha ao enviar notificação:', err.statusCode, err.body);
  if (err.statusCode === 404 || err.statusCode === 410) {
    console.error(
      'A inscrição expirou ou foi revogada. Reative as notificações no app e atualize o secret PUSH_SUBSCRIPTION.',
    );
  }
  process.exit(1);
}
