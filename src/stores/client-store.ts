// Minimal client-store for the standalone charts app. The full client-store.ts
// in tradexpro-botbuilder (737 lines) covers account switching UI, USD/KES
// rate fetching, and other bot-builder-specific concerns. The charts page only
// needs `loginid` (to key ChartWrapper's remount-on-account-switch) plus the
// two methods api-base.ts calls directly during the WebSocket auth flow:
// setWebSocketLoginId and setIsAccountRegenerating.
import { action, makeObservable, observable } from 'mobx';
import { observer as globalObserver } from '@/external/bot-skeleton';

export default class ClientStore {
    loginid: string | undefined = undefined;
    is_account_regenerating = false;
    instance_id: string;

    constructor() {
        makeObservable(this, {
            loginid: observable,
            is_account_regenerating: observable,
            setWebSocketLoginId: action,
            setIsAccountRegenerating: action,
        });

        this.loginid = localStorage.getItem('active_loginid') || undefined;

        // Same registration pattern as tradexpro-botbuilder's client-store:
        // api-base.ts looks up 'client.store' via globalObserver to call
        // setWebSocketLoginId/setIsAccountRegenerating during auth.
        const existingId = globalObserver.getState('client.store.id');
        if (existingId) {
            globalObserver.setState({ 'client.store': null, 'client.store.id': null });
        }
        this.instance_id = `client_store_${Date.now()}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
        globalObserver.setState({ 'client.store': this, 'client.store.id': this.instance_id });

        globalObserver.register('api.authorize', (data: { current_account?: { loginid?: string } }) => {
            if (data?.current_account?.loginid) {
                this.setWebSocketLoginId(data.current_account.loginid);
            }
        });
    }

    setWebSocketLoginId(login_id: string) {
        this.loginid = login_id;
    }

    setIsAccountRegenerating(is_loading: boolean) {
        this.is_account_regenerating = is_loading;
    }
}
