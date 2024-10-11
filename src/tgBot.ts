import { Telegraf } from 'telegraf';
import * as fs from 'fs';

const ADMIN_FILE = './admin';
const DELIMITER = ';';

const bot = new Telegraf(process.env.BOT_TOKEN);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let admin: number;
let chatId: number;
let started: boolean;

bot.start((ctx) => {
  if (!isInitialized()) {
    admin = ctx.from.id;
    chatId = ctx.chat.id;
    fs.writeFileSync(
      ADMIN_FILE,
      `${admin.toString()}${DELIMITER}${chatId.toString()}`,
    );
    ctx.reply('You are the admin now');
  } else {
    ctx.reply('Hello');
  }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

function isInitialized(): boolean {
  return admin !== null && admin !== undefined && admin !== 0;
}

function start() {
  if (started) {
    return;
  }

  const savedAdmin = fs.readFileSync(ADMIN_FILE, 'utf-8');
  if (savedAdmin != '') {
    const [adminStr, chatIdStr] = savedAdmin.split(DELIMITER);
    admin = parseInt(adminStr);
    chatId = parseInt(chatIdStr);
  }
  bot
    .launch()
    .then(() => console.log('bot stoped'))
    .catch((e) => console.error('bot stoped with error', e));
  started = true;
}

function sendMessage(message: string) {
  bot.telegram.sendMessage(chatId, message);
}

export { sendMessage, isInitialized, start };
