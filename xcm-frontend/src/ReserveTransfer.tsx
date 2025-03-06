import React, { useRef, useState } from "react";
import { reserveTransferToParachain } from "./api";
import { useSelectedAccount, useToken } from "./context";
import { TxEvent } from "polkadot-api";

const TxStatus: React.FC<{ status: TxEvent | null }> = ({ status }) => {
  if (!status) return null;
  if (status.type === "signed") return <div>Tx Signed {status.txHash}</div>;
  if (status.type === "broadcasted")
    return <div>Tx Broadcasted {status.txHash}</div>;
  if (status.type === "txBestBlocksState")
    return status.found ? (
      <div>
        Tx included in best block {status.block.hash}-{status.block.index}
      </div>
    ) : (
      <div>Tx Broadcasted {status.txHash}</div>
    );

  return (
    <div>
      Tx finalized in: {status.block.hash}-{status.block.index}
    </div>
  );
};

export const ReserveTransfer: React.FC = () => {
  const { decimals } = useToken();
  const account = useSelectedAccount();
  const ref = useRef<bigint>(0n);
  const [txStatus, setTxStatus] = useState<TxEvent | null>(null);

  const teleport = () => {
    reserveTransferToParachain(account.address, ref.current)
      .signSubmitAndWatch(account.polkadotSigner)
      .subscribe((x: any) => {
        setTxStatus(x);
        if (x.type === "finalized")
          setTimeout(() => {
            setTxStatus(null);
          }, 2_000);
      });
  };

  return (
    <div>
      <h2>Reserve Transfer: </h2>
      <button onClick={() => teleport()}>↓ To ParaChain ↓</button>
      <TxStatus status={txStatus} />
    </div>
  );
};
