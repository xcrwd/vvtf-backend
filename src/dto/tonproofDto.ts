import { TonChain } from './tonChain';

export class TonProof {
  timestamp: string;
  domain: {
    lengthBytes: number;
    value: string;
  };
  signature: string;
  payload: string;
  stateInit: string;
  network: TonChain;
  address: string;
  publicKey: string;
}
