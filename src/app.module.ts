import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TonSignature } from './ton.signature.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    /* TgBotModule*/
  ],
  controllers: [AppController],
  providers: [TonSignature /*, TgBotClient*/],
})
export class AppModule {}
