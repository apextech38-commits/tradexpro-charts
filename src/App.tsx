import { useEffect, useState } from 'react';
import { setSmartChartsPublicPath } from '@deriv/deriv-charts';
import RootStore from '@/stores/root-store';
import { StoreContext } from '@/hooks/useStore';
import ChartWrapper from '@/pages/chart/chart-wrapper';
import { api_base } from '@/external/bot-skeleton';
import './app.scss';

// smartcharts-champion's dynamic chunk loading (flutter-chart-loader, i18n
// json chunks, etc.) auto-detects its own base path by scanning <script> tags
// for one whose src matches its own bundle filename — a classic webpack
// runtime pattern. That only works if the bundle is loaded via a literal
// <script> tag at a known path. Since Vite imports it as an ES module through
// its dependency graph instead, that auto-detection resolves to the wrong
// path (site root) and every dynamic chunk 404s. profithubnewtool sidesteps
// this the same way, in its app shell (app-content.jsx) rather than the chart
// page itself: call the package's own explicit override once, early, before
// any chart tries to load a dynamic chunk. The assets live at /js/smartcharts/
// because that's where scripts/copy-smartcharts-assets.js puts them (see
// package.json postinstall).
setSmartChartsPublicPath('/js/smartcharts/');

// Module-level singleton, deliberately outside the component. api_base.init()
// has an early-return guard (`if (this.is_initializing) return;`) that makes
// it unsafe to call twice concurrently — the second call resolves instantly
// without waiting for the first to finish. React 18 StrictMode double-invokes
// effects in dev (mount → cleanup → mount again), which was calling init()
// twice and letting the second, premature "ready" state win the race. This
// promise is created once and shared across both invocations, so both await
// the same real completion instead of racing two separate calls.
let bootPromise: Promise<void> | null = null;

function bootApiBase(): Promise<void> {
    if (!bootPromise) {
        bootPromise = (async () => {
            await api_base.init();

            if (api_base.active_symbols_promise) {
                await api_base.active_symbols_promise.catch(() => {});
            } else if (!api_base.has_active_symbols) {
                await api_base.getActiveSymbols?.().catch(() => {});
            }
        })();
    }
    return bootPromise;
}

const App = () => {
    const [store] = useState(() => new RootStore());
    const [is_api_ready, setIsApiReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        bootApiBase().then(() => {
            if (!cancelled) {
                console.log('[boot] active_symbols count:', api_base.active_symbols?.length);
                console.log('[boot] has_active_symbols:', api_base.has_active_symbols);
                console.log('[boot] api_base.api exists:', !!api_base.api);
                setIsApiReady(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (is_api_ready) {
            store.chart_store.updateSymbol();
        }
    }, [is_api_ready, store]);

    return (
        <StoreContext.Provider value={store}>
            <div className='charts-app'>
                <ChartWrapper show_digits_stats={false} />
            </div>
        </StoreContext.Provider>
    );
};

export default App;
