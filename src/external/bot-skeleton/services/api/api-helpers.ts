// Minimal stub. The real bot-skeleton ApiHelpers instantiates TradingTimes,
// ContractsFor, ActiveSymbols, and AccountLimits — all bot-builder-specific
// (populate Blockly dropdown options for contract types/markets). api-base.ts
// only ever calls ApiHelpers.disposeInstance() during reconnection, so that's
// the only method the standalone charts app needs.
class ApiHelpers {
    static singleton: unknown = null;

    static disposeInstance() {
        this.singleton = null;
    }
}

export default ApiHelpers;
