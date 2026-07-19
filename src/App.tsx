import { useEffect, useState } from 'react';
import { setSmartChartsPublicPath } from '@deriv/deriv-charts';
import { initializeI18n, TranslationProvider, useTranslations } from '@deriv-com/translations';
import RootStore from '@/stores/root-store';
import { StoreContext } from '@/hooks/useStore';
import ChartWrapper from '@/pages/chart/chart-wrapper';
import { api_base } from '@/external/bot-skeleton';
import './app.scss';

setSmartChartsPublicPath('/js/smartcharts/');

// Translations CDN is optional — same pattern as tradexpro-botbuilder's
// src/app/App.tsx. Without CDN env vars, this defaults to English.
const i18nInstance = initializeI18n({ cdnUrl: '' });

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

// useTranslations() must be called inside TranslationProvider's subtree, not
// the same component that renders the provider — hence this split. Missing
// this entirely (chart.tsx reads common.current_language for SmartChart's
// settings.language prop) meant that prop was always an empty string, which
// is the likely reason SmartChart never issued a ticks_history request:
// confirmed via the WebSocket Messages panel showing active_symbols,
// trading_times, and heartbeats, but no ticks_history/ticks request ever,
// even after multiple heartbeat cycles had passed.
const AppInner = () => {
    const [store] = useState(() => new RootStore());
    const [is_api_ready, setIsApiReady] = useState(false);
    const { currentLang } = useTranslations();

    useEffect(() => {
        if (currentLang) {
            store.common.setCurrentLanguage(currentLang);
        }
    }, [currentLang, store]);

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

const App = () => (
    <TranslationProvider defaultLang='EN' i18nInstance={i18nInstance}>
        <AppInner />
    </TranslationProvider>
);

export default App;
