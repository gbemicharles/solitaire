require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:5173';

bot.start((ctx) => {
  ctx.replyWithHTML(
    '<b>Welcome to Solitaire Cash!</b>\n\nPlay Solitaire, compete in matches, and earn rewards.\n\nPress the button below to start building your fortune!',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🎰 Play Solitaire', WEB_APP_URL)],
    ])
  );
});

bot.help((ctx) => ctx.reply('Send /start to play Solitaire Cash!'));

bot.launch().then(() => {
  console.log('Solitaire Cash Bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
