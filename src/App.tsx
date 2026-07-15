import { useEffect, useState } from 'react';
import RootStore from '@/stores/root-store';
import { StoreContext } from '@/hooks/useStore';
import ChartWrapper from '@/pages/chart/chart-wrapper';
import { api_base } from '@/external/bot-skeleton';
import './app.scss';

const App = () => {
    const [store] = useState(() => new RootStore());
    const [is_api_ready, setIsApiReady] = useState(false);

    useEffect(() => {
        api_base.init();
        // api-base.ts emits 'api.authorize' once the WebSocket auth flow completes;
        // active_symbols become available shortly after, at which point chart-store
        // can resolve a default symbol.
        const unsubscribe = () => {};
        api_base.getActiveSymbols?.()
            ?.catch(() => {})
            .finally(() => setIsApiReady(true));
        return unsubscribe;
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
