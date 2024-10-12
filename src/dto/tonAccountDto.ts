import { TonChain } from './tonChain';

export class TonAccountDto {
  stateInit: string;
  network: TonChain;
  address: string;
  publicKey: string;
}
