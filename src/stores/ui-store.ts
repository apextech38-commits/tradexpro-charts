import { action, makeObservable, observable } from 'mobx';

// Minimal — the full ui-store.ts in tradexpro-botbuilder covers many more
// bot-builder UI flags (dialogs, drawers, tours). chart.tsx only reads these two.
export default class UiStore {
    is_chart_layout_default = true;
    is_dark_mode_on = localStorage.getItem('theme') === 'dark';
    is_chart_asset_info_visible = false;

    constructor() {
        makeObservable(this, {
            is_dark_mode_on: observable,
            setDarkMode: action,
        });
    }

    setDarkMode(value: boolean) {
        this.is_dark_mode_on = value;
        localStorage.setItem('theme', value ? 'dark' : 'light');
    }
}
