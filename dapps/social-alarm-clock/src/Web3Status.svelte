<script lang ts>
  import { account, ensName } from "./lib/chainClient";
  import { web3Modal } from "./lib/chainClient";
  import { shorthandAddress } from "@scp/dapp-lib";

  let displayName;
  $: if ($account?.address) {
    displayName = $ensName ? $ensName : shorthandAddress($account.address);
  }

  $: indicatorColor = $account && $account.isConnected ? "green" : "red";
</script>

{#if $account && displayName}
  <div class="container" on:click={$web3Modal.openModal}>
    <div class="displayName">{displayName}</div>
    <div class="indicator" style="background-color:{indicatorColor}" />
  </div>
{/if}

<style>
  .container {
    display: flex;
    justify-content: flex-end;
    background: none;
  }

  .indicator {
    height: 10px;
    width: 10px;
    border-radius: 100%;
    background-color: var(--indicator-color);
    margin: 0 0.5em;
  }

  .displayName {
    font-size: smaller;
    color: rgb(201, 145, 34);
  }
</style>
