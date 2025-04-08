import {
    Finding,
    HandleTransaction,
    TransactionEvent,
    FindingSeverity,
    FindingType,
    getEthersProvider,
  } from "forta-agent";
  
  const HIGH_GAS_THRESHOLD_GWEI = 50; // customizable threshold
  
  function isSwapFunction(inputData: string): boolean {
    // Common DEX function selectors for Uniswap/Sushi/etc.
    const knownSelectors = [
      "0x38ed1739", // swapExactTokensForTokens
      "0x18cbafe5", // swapExactETHForTokens
      "0x8803dbee", // swapTokensForExactTokens
      "0x7ff36ab5", // swapExactETHForTokens
      "0x5c11d795", // swapExactTokensForETH
    ];
    return knownSelectors.some(selector => inputData.startsWith(selector));
  }
  
  function getGasPriceInGwei(txEvent: TransactionEvent): number {
    return Number(txEvent.transaction.gasPrice) / 1e9;
  }
  
  function isHighGasSwap(txEvent: TransactionEvent): boolean {
    return isSwapFunction(txEvent.transaction.data) &&
           getGasPriceInGwei(txEvent) >= HIGH_GAS_THRESHOLD_GWEI;
  }
  
  const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
    const findings: Finding[] = [];
  
    // Only analyze swap txs
    if (!isHighGasSwap(txEvent)) return findings;
  
    const attacker = txEvent.from;
    const gasPriceGwei = getGasPriceInGwei(txEvent);
  
    const alert = Finding.fromObject({
      name: "Possible Sandwich Attack Detected",
      description: `Swap transaction with high gas (${gasPriceGwei} gwei) potentially part of MEV sandwich.`,
      alertId: "MEV-1",
      severity: FindingSeverity.High,
      type: FindingType.Suspicious,
      protocol: "ethereum",
      metadata: {
        attacker,
        txHash: txEvent.hash,
        gasPriceGwei: gasPriceGwei.toFixed(2),
        functionSelector: txEvent.transaction.data.slice(0, 10),
      },
    });
  
    findings.push(alert);
    return findings;
  };
  
  export default {
    handleTransaction,
  };
  