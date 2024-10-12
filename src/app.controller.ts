import { Body, HttpException, HttpStatus } from '@nestjs/common';
import { Controller, Post } from '@nestjs/common';
import { TonSignature } from './ton.signature.service';
import { VerifiableFormDto } from './dto/verifiableFormDto';
import * as tgBot from './tg.bot';

@Controller()
export class AppController {
  constructor(private readonly tonSignature: TonSignature) {}

  @Post('/api/form')
  async checkForm(@Body() verifiableFormDto: VerifiableFormDto) {
    // todo:
    // 1. transform form into str
    // 2. take sha256 hash
    // 3. compare with verifiableFormDto.tonProof.payload hash
    // 4. 404 if not equal

    if (
      !(await this.tonSignature.checkSignature(
        verifiableFormDto.tonproof,
        verifiableFormDto.account,
      ))
    ) {
      throw new HttpException('Bad signature', HttpStatus.BAD_REQUEST);
    }

    const msg = [];
    for (const [k, v] of Object.entries(verifiableFormDto.form)) {
      msg.push(k, '\n', v, '\n');
    }
    msg.push(`Signature: ${verifiableFormDto.tonproof.signature}`);
    tgBot.sendMessage(JSON.stringify(msg.join('\n')));
  }
}
