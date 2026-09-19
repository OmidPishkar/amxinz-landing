export function buildSignMessage(address: string, nonce: string) {
  return [
    "Sign in to Amxinz",
    "",
    "This request does not trigger a transaction or cost any gas.",
    "",
    `Wallet: ${address}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
