import { Enum, FixedSizeBinary, SS58String } from "polkadot-api";
import type {
  PaseoXcmVersionedAssets,
  PaseoXcmVersionedLocation,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3WeightLimit,
} from "@polkadot-api/descriptors";
import {
  paseoAssetHubChainApi,
  PASEO_ASSET_HUB_CHAIN_ID,
} from "./asset-hub-chain";
import { PASEO_PEOPLE_CHAIN_ID } from "./people-chain";
import { paseoRelayChainApi } from "./relay-chain";

const unlimitedWeight = (): XcmV3WeightLimit => Enum("Unlimited");

const here = (): XcmV3Junctions => Enum("Here");

const x1 = (junction: XcmV3Junction): XcmV3Junctions =>
  Enum("X1", junction);

const parachain = (paraId: number): XcmV3Junction =>
  Enum("Parachain", paraId);

const accountId = (address: SS58String): XcmV3Junction =>
  Enum("AccountId32", {
    id: FixedSizeBinary.fromAccountId32(address),
  });

const location = (
  parents: number,
  interior: XcmV3Junctions,
): PaseoXcmVersionedLocation =>
  Enum("V4", {
    parents,
    interior,
  });

const asset = (parents: number, amount: bigint): PaseoXcmVersionedAssets =>
  Enum("V4", [
    {
      id: {
        parents,
        interior: here(),
      },
      fun: Enum("Fungible", amount),
    },
  ]);

export const reserveTransferToParachain = (
  address: SS58String,
  amount: bigint,
) =>
  paseoAssetHubChainApi.tx.PolkadotXcm.limited_reserve_transfer_assets({
    dest: location(1, x1(parachain(PASEO_PEOPLE_CHAIN_ID))),
    beneficiary: location(0, x1(accountId(address))),
    assets: asset(1, amount),
    fee_asset_item: 0,
    weight_limit: unlimitedWeight(),
  });

export const teleportToParaChain = (address: SS58String, amount: bigint) => {
  return paseoRelayChainApi.tx.XcmPallet.limited_teleport_assets({
    dest: location(0, x1(parachain(PASEO_ASSET_HUB_CHAIN_ID))),
    beneficiary: location(0, x1(accountId(address))),
    assets: asset(0, amount),
    fee_asset_item: 0,
    weight_limit: unlimitedWeight(),
  });
};

export const teleportToRelayChain = (
  address: SS58String,
  amount: bigint,
) =>
  paseoAssetHubChainApi.tx.PolkadotXcm.limited_teleport_assets({
    dest: location(1, here()),
    beneficiary: location(0, x1(accountId(address))),
    assets: asset(1, amount),
    fee_asset_item: 0,
    weight_limit: unlimitedWeight(),
  });
