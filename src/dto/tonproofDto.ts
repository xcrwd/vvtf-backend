import { TonAccountDto } from './tonAccountDto';

export class TonProof {
  timestamp: string;
  domain: {
    lengthBytes: number;
    value: string;
  };
  signature: string;
  payload: string;
  account: TonAccountDto;
}
