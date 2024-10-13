import { Form } from './form';
import { TgUserDto } from './tgUserDto';
import { TonAccountDto } from './tonAccountDto';
import { TonProof } from './tonproofDto';

export class VerifiableFormDto {
  tonproof: TonProof;
  account: TonAccountDto;
  form: Form;
  tgAccount: TgUserDto;
}
