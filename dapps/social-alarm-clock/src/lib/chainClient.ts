import { derived, get, writable, type Readable } from "svelte/store";
import {
  configureChains,
  createClient,
  fetchEnsName,
  fetchSigner,
  type GetNetworkResult,
  type GetAccountResult,
  switchNetwork,
} from "@wagmi/core";
import { mainnet, polygon, hardhat } from "@wagmi/core/chains";
import { Web3Modal } from "@web3modal/html";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import type { ethers } from "ethers";

const supportedChains = [hardhat];

// Wagmi Core Client
export const { provider } = configureChains(supportedChains, [
  walletConnectProvider({ projectId: "698bddafdbc932fc6eb19c24ab471c3a" }),
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({
    projectId: "698bddafdbc932fc6eb19c24ab471c3a",
    version: "1", // or "2"
    appName: "web3Modal",
    chains: supportedChains,
  }),
  provider,
});

export const ethClient = writable(
  new EthereumClient(wagmiClient, supportedChains)
);
export const web3Modal = derived(
  ethClient,
  ($ethClient) =>
    new Web3Modal({ projectId: "698bddafdbc932fc6eb19c24ab471c3a" }, $ethClient)
);

export const account = writable<GetAccountResult | undefined>();
export const network = writable<GetNetworkResult | undefined>();

export const signer = derived(
  [account, network],
  ([$account, $network], set) => {
    if (!$network?.chain?.id || !$account) return;
    fetchSigner({ chainId: $network.chain.id }).then(set);
  }
) as Readable<ethers.Signer | undefined>;

export const ensName = derived([account, network], ([$account], set) => {
  if (!$account) return;

  fetchEnsName({ address: $account.address })
    .then(set)
    .catch(() => {
      console.log("No ens found");
      set(undefined);
    });
}) as Readable<string | undefined>;

get(ethClient).watchAccount(account.set);
get(ethClient).watchNetwork((net) => {
  if (!net.chain) return;

  network.set(net);
  if (!supportedChains.map((c) => c.id as number).includes(net.chain.id)) {
    switchNetwork({ chainId: supportedChains[0].id });
  }
});
