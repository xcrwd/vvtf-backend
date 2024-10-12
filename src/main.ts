import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { start as tgBotStart } from './tgBot';

async function bootstrapNest() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.API_PORT);
  process.once('SIGINT', () => app.close());
  process.once('SIGTERM', () => app.close());
}

async function main() {
  bootstrapNest().catch(console.error);
  tgBotStart();
}

main();
