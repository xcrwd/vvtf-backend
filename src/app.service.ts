import { Injectable } from '@nestjs/common';
import { PostFormDto } from './dto/postFormDto';

@Injectable()
export class TonSignature {
  checkSignature(postFormDto: PostFormDto): boolean {
    console.log(postFormDto);
    return false;
  }
}
