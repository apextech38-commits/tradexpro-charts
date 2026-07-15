// Minimal localStorage wrapper. The real LocalStore in
// components/shared/utils/storage/storage.ts also exports SessionStore,
// cookie helpers, and domain-aware removeCookies — none of which chart-store.ts
// needs. This covers just get/set/remove for 'charts.chart_props'.
class LocalStoreImpl {
    get(key: string): string | undefined {
        return localStorage.getItem(key) || undefined;
    }
    set(key: string, value: string) {
        if (typeof value !== 'undefined') {
            localStorage.setItem(key, value);
        }
    }
    remove(key: string) {
        localStorage.removeItem(key);
    }
}

export const LocalStore = new LocalStoreImpl();
