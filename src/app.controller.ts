import { Body, HttpException, HttpStatus } from '@nestjs/common';
import { Controller, Post } from '@nestjs/common';
import { TonSignature } from './ton.signature.service';
import { VerifiableFormDto } from './dto/verifiableFormDto';
import * as tgBot from './tg.bot';
import { Form } from './dto/form';

@Controller()
export class AppController {
  constructor(private readonly tonSignature: TonSignature) {}

  @Post('/api/form')
  async checkForm(@Body() verifiableFormDto: VerifiableFormDto) {
    if (
      (await payloadFromForm(verifiableFormDto.form)) !=
      verifiableFormDto.tonproof.payload
    ) {
      throw new HttpException('Form hash mismatch', HttpStatus.BAD_REQUEST);
    }

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
      msg.push(`*${k}*`, '%0A', v, '%0A');
    }
    msg.push(
      `*Signature: ${verifiableFormDto.tonproof.signature.replaceAll('+', '\\+')}*`,
    );
    tgBot.sendMessage(JSON.stringify(msg.join('%0A')));
  }
}

async function payloadFromForm(form: Form): Promise<string> {
  const keys = Object.keys(form).sort();

  const query = keys
    .reduce(
      (acc: string[], key) => acc.concat(key + '=' + String(form[key])),
      [],
    )
    .join('&');

  const sha = await sha256(query);
  return sha;
}

async function sha256(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex;
}
