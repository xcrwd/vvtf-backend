import { sha256 } from '@ton/crypto';
import { Injectable } from '@nestjs/common';
import {
  Address,
  Cell,
  contractAddress,
  loadStateInit,
  StateInit,
} from '@ton/ton';
import { TonProof } from './dto/tonproofDto';
import { knownWallets } from './ton.known.wallets';
import { TonApiService } from './ton.api.service';
import { sign } from 'tweetnacl';

const tonProofPrefix = 'ton-proof-item-v2/';
const tonConnectPrefix = 'ton-connect';

@Injectable()
export class TonSignature {
  async checkSignature(tonProof: TonProof): Promise<boolean> {
    try {
      const client = TonApiService.create(tonProof.network);

      const stateInit = loadStateInit(
        Cell.fromBase64(tonProof.stateInit).beginParse(),
      );

      const publicKey =
        this.tryParsePublicKey(stateInit) ??
        (await client.getWalletPublicKey(tonProof.address));
      if (!publicKey) {
        return false;
      }

      const wantedPublicKey = Buffer.from(tonProof.publicKey, 'hex');
      if (!publicKey.equals(wantedPublicKey)) {
        return false;
      }

      const wantedAddress = Address.parse(tonProof.address);
      const address = contractAddress(wantedAddress.workChain, stateInit);
      if (!address.equals(wantedAddress)) {
        return false;
      }

      // skip domain check
      // skip time check

      const message = {
        workchain: address.workChain,
        address: address.hash,
        domain: {
          lengthBytes: tonProof.domain.lengthBytes,
          value: tonProof.domain.value,
        },
        signature: Buffer.from(tonProof.signature, 'base64'),
        payload: tonProof.payload,
        stateInit: tonProof.stateInit,
        timestamp: tonProof.timestamp,
      };

      const wc = Buffer.alloc(4);
      wc.writeUInt32BE(message.workchain, 0);

      const ts = Buffer.alloc(8);
      ts.writeBigUInt64LE(BigInt(message.timestamp), 0);

      const dl = Buffer.alloc(4);
      dl.writeUInt32LE(message.domain.lengthBytes, 0);

      // message = utf8_encode("ton-proof-item-v2/") ++
      //           Address ++
      //           AppDomain ++
      //           Timestamp ++
      //           Payload
      const msg = Buffer.concat([
        Buffer.from(tonProofPrefix),
        wc,
        message.address,
        dl,
        Buffer.from(message.domain.value),
        ts,
        Buffer.from(message.payload),
      ]);

      const msgHash = Buffer.from(await sha256(msg));

      // signature = Ed25519Sign(privkey, sha256(0xffff ++ utf8_encode("ton-connect") ++ sha256(message)))
      const fullMsg = Buffer.concat([
        Buffer.from([0xff, 0xff]),
        Buffer.from(tonConnectPrefix),
        msgHash,
      ]);

      const result = Buffer.from(await sha256(fullMsg));

      return sign.detached.verify(result, message.signature, publicKey);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private tryParsePublicKey(stateInit: StateInit): Buffer | null {
    if (!stateInit.code || !stateInit.data) {
      return null;
    }

    for (const { wallet, loadData } of knownWallets) {
      if (wallet.init.code.equals(stateInit.code)) {
        return loadData(stateInit.data.beginParse()).publicKey;
      }
    }

    return null;
  }
}
