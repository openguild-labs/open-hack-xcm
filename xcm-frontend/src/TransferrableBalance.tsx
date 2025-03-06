import React, { useRef, useState } from "react";
import { reserveTransferToParachain } from "./api/teleport";
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

export const TransferrableBalance: React.FC = () => {
  const { decimals } = useToken();
  const account = useSelectedAccount();
  const ref = useRef<bigint>(0n);
  const [txStatus, setTxStatus] = useState<TxEvent | null>(null);
  const [amount, setAmount] = useState<string>("0");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    try {
      const parsedAmount = BigInt(Number(value) * 10 ** decimals);
      ref.current = parsedAmount;
    } catch (e) {
      console.error("Invalid amount");
    }
  };

  const teleport = () => {
    if (!account) {
      console.error("No account selected");
      return;
    }
    
    reserveTransferToParachain(account.address, ref.current)
      .signSubmitAndWatch(account.polkadotSigner)
      .subscribe({
        next: (x) => {
          setTxStatus(x);
          if (x.type === "finalized")
            setTimeout(() => {
              setTxStatus(null);
            }, 2_000);
        },
        error: (err) => {
          console.error("Transaction failed:", err);
          setTxStatus(null);
        }
      });
  };

  return (
    <div>
      <h2>Reserve Transfer: </h2>
      <div>
        <input 
          type="number" 
          value={amount} 
          onChange={handleAmountChange} 
          placeholder="Amount to transfer" 
        />
      </div>
      <button onClick={teleport} disabled={!account}>↓ To ParaChain ↓</button>
      <TxStatus status={txStatus} />
    </div>
  );
};