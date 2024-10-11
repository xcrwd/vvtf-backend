import { Body, HttpException, HttpStatus } from '@nestjs/common';
import { Controller, Post } from '@nestjs/common';
import { TonSignature } from './app.service';
import { PostFormDto } from './dto/postFormDto';
import * as tgBot from './tgBot';

@Controller()
export class AppController {
  constructor(private readonly tonSignature: TonSignature) {}

  @Post('/api/form')
  checkForm(@Body() postFormDto: PostFormDto) {
    if (!this.tonSignature.checkSignature(postFormDto)) {
      throw new HttpException('Bad signature', HttpStatus.BAD_REQUEST);
    }

    // todo: format payload into msg
    tgBot.sendMessage(JSON.stringify(postFormDto.payload));
  }
}
