import { PolkadotClient } from "polkadot-api";
import { createContext, useContext } from "react";
import {
  PaseoAssetHubChainApi,
  PaseoPeopleChainApi,
  PaseoRelayChainApi,
} from "../api";

export const chainCtx = createContext<{
  client: PolkadotClient;
  api: PaseoAssetHubChainApi | PaseoPeopleChainApi | PaseoRelayChainApi;
} | null>(null);
export const useChain = () => useContext(chainCtx)!;

export const ChainProvider = chainCtx.Provider;
