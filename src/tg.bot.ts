import { Telegraf } from 'telegraf';
import * as fs from 'fs';
import 'dotenv/config';

const CHAT_LIST_FILE = process.env.TG_CHAT_LIST_FILE;

const bot = new Telegraf(process.env.TG_BOT_TOKEN);

interface Chat {
  userId: number;
  chatId: number;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let started: boolean;
let chatList: Chat[] = [];

bot.start((ctx) => {
  const userId = ctx.from.id;
  if (!isInitialized()) {
    const chatId = ctx.chat.id;
    chatList.push({ userId, chatId });
    fs.writeFileSync(CHAT_LIST_FILE, JSON.stringify(chatList));
    ctx.reply('You are the admin now');
  } else {
    ctx.reply(`Hello! Your id: ${userId}`);
  }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

function isInitialized(): boolean {
  return chatList.length !== 0;
}

function start() {
  if (started) {
    return;
  }

  chatList = JSON.parse(
    fs.readFileSync(CHAT_LIST_FILE, {
      encoding: 'utf-8',
      flag: 'a+',
    }),
  );

  bot
    .launch()
    .then(() => console.log('bot stoped'))
    .catch((e) => console.error('bot stoped with error', e));
  started = true;
}

async function sendMessage(message: string) {
  for (const { chatId } of chatList) {
    try {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'MarkdownV2',
      });
      // bot.telegram.sendMessage(chatId, message);
    } catch (e) {
      console.error(e);
    }
  }
}

export { sendMessage, isInitialized, start };
