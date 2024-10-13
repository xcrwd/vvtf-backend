import { Body, HttpException, HttpStatus } from '@nestjs/common';
import { Controller, Get, Post } from '@nestjs/common';
import { TonSignature } from './ton.signature.service';
import { VerifiableFormDto } from './dto/verifiableFormDto';
import * as tgBot from './tg.bot';
import { Form } from './dto/form';

const ESCP = '\u000a';

@Controller()
export class AppController {
  constructor(private readonly tonSignature: TonSignature) {}

  @Get('/')
  async healthcheck() {}

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
      msg.push(`*${k}*: ${v}${ESCP}`);
    }
    msg.push(
      `*Ton address*: ${verifiableFormDto.account.address}${ESCP}`,
      `*Tg nickname*: @${verifiableFormDto.tgAccount.username}${ESCP}`,
      `*Signature*: ${verifiableFormDto.tonproof.signature.replaceAll('+', '\\+').replaceAll('=', '\\=')}`,
    );
    await tgBot.sendMessageToChatList(msg.join(ESCP));
    if (verifiableFormDto.tgAccount && verifiableFormDto.tgAccount.id) {
      await tgBot.sendMessageById(
        `Much thanks${ESCP}@${ESCP}Such great`,
        verifiableFormDto.tgAccount.id,
      );
    }
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
