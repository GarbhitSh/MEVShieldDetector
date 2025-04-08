import { createTransactionEvent, TestTransactionEvent } from "forta-agent-tools/lib/test";
import { FindingType, FindingSeverity } from "forta-agent";
import MEVShieldDetector from "../src/MEVShieldDetector";

describe("MEVShieldDetector", () => {
  it("should not return findings for non-swap transactions", async () => {
    const txEvent = new TestTransactionEvent()
      .setFrom("0x123")
      .setGasPrice("0x1") // low gas
      .setTransaction({ data: "0xabcdef00" }); // random function

    const findings = await MEVShieldDetector.handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("should not return findings for swap with low gas", async () => {
    const txEvent = new TestTransactionEvent()
      .setFrom("0xabc")
      .setGasPrice((30e9).toString()) // 30 gwei
      .setTransaction({ data: "0x38ed1739" }); // swapExactTokensForTokens

    const findings = await MEVShieldDetector.handleTransaction(txEvent);
    expect(findings).toStrictEqual([]);
  });

  it("should return a finding for swap with high gas", async () => {
    const txEvent = new TestTransactionEvent()
      .setFrom("0xattacker")
      .setHash("0xattackhash")
      .setGasPrice((80e9).toString()) // 80 gwei
      .setTransaction({ data: "0x38ed1739" });

    const findings = await MEVShieldDetector.handleTransaction(txEvent);

    expect(findings).toHaveLength(1);
    expect(findings[0].name).toEqual("Possible Sandwich Attack Detected");
    expect(findings[0].severity).toEqual(FindingSeverity.High);
    expect(findings[0].type).toEqual(FindingType.Suspicious);
    expect(findings[0].metadata.attacker).toEqual("0xattacker");
  });

  it("should handle other known DEX swap selectors", async () => {
    const knownSelectors = [
      "0x18cbafe5", "0x8803dbee", "0x7ff36ab5", "0x5c11d795"
    ];

    for (const selector of knownSelectors) {
      const txEvent = new TestTransactionEvent()
        .setFrom("0xmevbot")
        .setHash("0xhash" + selector)
        .setGasPrice((100e9).toString())
        .setTransaction({ data: selector });

      const findings = await MEVShieldDetector.handleTransaction(txEvent);
      expect(findings).toHaveLength(1);
      expect(findings[0].metadata.functionSelector).toEqual(selector);
    }
  });
});
