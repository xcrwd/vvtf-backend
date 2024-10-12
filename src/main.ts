import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { start as tgBotStart } from './tg.bot';

async function bootstrapNest() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });
  await app.listen(process.env.API_PORT || 3000);
  process.once('SIGINT', () => app.close());
  process.once('SIGTERM', () => app.close());
}

async function main() {
  console.log();
  bootstrapNest().catch(console.error);
  tgBotStart();
}

main();
