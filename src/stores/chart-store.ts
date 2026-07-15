import { action, makeObservable, observable } from 'mobx';
import { LocalStore } from '@/utils/local-store';
import { api_base } from '@/external/bot-skeleton';
import RootStore from './root-store';

type TSubscription = {
    id: string | null;
    subscriber: null | { unsubscribe: () => void };
};

// Stripped down from profithubnewtool's chart-store.ts for standalone charts app.
// Removed: Blockly workspace coupling (window.Blockly.derivWorkspace lookup for
// default symbol), run_panel.is_running reaction (no bot execution here),
// is_contract_ended computed (was dead code, unused outside this store).
export default class ChartStore {
    root_store: RootStore;
    constructor(root_store: RootStore) {
        makeObservable(this, {
            symbol: observable,
            is_chart_loading: observable,
            chart_type: observable,
            granularity: observable,
            updateSymbol: action,
            onSymbolChange: action,
            updateGranularity: action,
            updateChartType: action,
            setChartStatus: action,
            restoreFromStorage: action,
            chart_subscription_id: observable,
            setChartSubscriptionId: action,
        });

        this.root_store = root_store;
        this.restoreFromStorage();
    }

    subscription: TSubscription = {
        id: null,
        subscriber: null,
    };
    chart_subscription_id = '';

    symbol: string | undefined;
    is_chart_loading: boolean | undefined;
    chart_type: string | undefined;
    granularity: number | undefined;

    // Default symbol now comes solely from active_symbols[0] (no Blockly block to read from).
    // Manual symbol switching via ChartTitle dropdown still works via onSymbolChange.
    updateSymbol = () => {
        const first_symbol = api_base?.active_symbols?.[0];
        const symbol = first_symbol
            ? (first_symbol as any).underlying_symbol || (first_symbol as any).symbol
            : undefined;
        this.symbol = symbol;
    };

    onSymbolChange = (symbol: string) => {
        this.symbol = symbol;
        this.saveToLocalStorage();
    };

    updateGranularity = (granularity: number) => {
        this.granularity = granularity;
        this.saveToLocalStorage();
    };

    updateChartType = (chart_type: string) => {
        this.chart_type = chart_type;
        this.saveToLocalStorage();
    };

    setChartStatus = (status: boolean) => {
        this.is_chart_loading = status;
    };

    saveToLocalStorage = () => {
        LocalStore.set(
            'charts.chart_props',
            JSON.stringify({
                symbol: this.symbol,
                granularity: this.granularity,
                chart_type: this.chart_type,
            })
        );
    };

    restoreFromStorage = () => {
        try {
            const props = LocalStore.get('charts.chart_props');

            if (props) {
                const { symbol, granularity, chart_type } = JSON.parse(props);
                this.symbol = symbol;
                this.granularity = granularity;
                this.chart_type = chart_type;
            } else {
                this.granularity = 0;
                this.chart_type = 'line';
            }
        } catch {
            LocalStore.remove('charts.chart_props');
        }
    };

    getMarketsOrder = (active_symbols: any[]) => {
        const synthetic_index = 'synthetic_index';

        if (!active_symbols || !Array.isArray(active_symbols)) {
            return [synthetic_index];
        }

        const has_synthetic_index = !!active_symbols.find(s => s.market === synthetic_index);

        return active_symbols
            .map(s => s.market)
            .reduce(
                (arr, market) => {
                    if (arr.indexOf(market) === -1) arr.push(market);
                    return arr;
                },
                has_synthetic_index ? [synthetic_index] : []
            );
    };

    setChartSubscriptionId = (chartSubscriptionId: string) => {
        this.chart_subscription_id = chartSubscriptionId;
    };
}
