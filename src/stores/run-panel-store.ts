import { action, makeObservable, observable } from 'mobx';

// Stub — there's no bot workspace/run-panel drawer in the standalone charts
// app. chart.tsx reads is_drawer_open for a CSS class only; stays false.
export default class RunPanelStore {
    is_drawer_open = false;
    is_running = false;

    constructor() {
        makeObservable(this, {
            is_drawer_open: observable,
        });
    }
}
