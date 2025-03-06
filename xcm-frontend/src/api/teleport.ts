import { AccountId, Binary, SS58String } from "polkadot-api";
import { paraChain, paseoAssetHubChainApi, PASEO_ASSET_HUB_CHAIN_ID } from "./asset-hub-chain";
import {
  paseo,
  paseo_asset_hub,
  paseo_people,
  XcmVersionedAsset,
  XcmVersionedLocation,
  XcmV3MultiassetFungibility,
  XcmV3Junction,
  XcmV3Junctions,
  XcmVersionedAssets,
  XcmV3WeightLimit,
} from "@polkadot-api/descriptors";
import { paseoRelayChainApi, relayChain } from "./relay-chain";
import { PASEO_PEOPLE_CHAIN_ID, paseoPeopleChainId } from "./people-chain";

export const reserveTransferToParachain = (
  recipientAddress: SS58String,
  transferAmount: bigint
): any => {
  const xcmTransaction = paseoAssetHubChainApi.tx.PolkadotXcm.reserve_transfer_assets({
    dest: XcmVersionedLocation.V4({
      parents: 0,
      interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(PASEO_PEOPLE_CHAIN_ID)),
    }),
    beneficiary: createBeneficiary(recipientAddress),
    assets: createNativeAsset(0, transferAmount),
    fee_asset_item: 0,
  });

  return xcmTransaction;
};

export const teleportToParaChain = (recipientAddress: SS58String, transferAmount: bigint) => {
  const xcmTransaction = paseoRelayChainApi.tx.XcmPallet.transfer_assets({
    dest: XcmVersionedLocation.V4({
      parents: 0,
      interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(PASEO_PEOPLE_CHAIN_ID)),
    }),
    beneficiary: createBeneficiary(recipientAddress),
    assets: createNativeAsset(0, transferAmount),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  });

  return xcmTransaction;
};

export const teleportToRelayChain = (
  recipientAddress: SS58String,
  transferAmount: bigint
): any => {
  const xcmTransaction = paseoPeopleChainId.tx.PolkadotXcm.limited_teleport_assets({
    dest: XcmVersionedLocation.V4({
      parents: 1,
      interior: XcmV3Junctions.Here(),
    }),
    beneficiary: createBeneficiary(recipientAddress),
    assets: createNativeAsset(1, transferAmount),
    fee_asset_item: 0,
    weight_limit: XcmV3WeightLimit.Unlimited(),
  });

  return xcmTransaction;
};

const encodeAccount = AccountId().enc;

const createBeneficiary = (address: SS58String | Uint8Array) =>
  XcmVersionedLocation.V4({
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.AccountId32({
        network: undefined,
        id: Binary.fromBytes(
          address instanceof Uint8Array ? address : encodeAccount(address)
        ),
      })
    ),
  });

const createNativeAsset = (parentChains: number, tokenAmount: bigint) =>
  XcmVersionedAssets.V4([
    {
      id: {
        parents: parentChains,
        interior: XcmV3Junctions.Here(),
      },
      fun: XcmV3MultiassetFungibility.Fungible(tokenAmount),
    },
  ]);