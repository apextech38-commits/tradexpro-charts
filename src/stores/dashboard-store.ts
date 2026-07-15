import { action, makeObservable, observable } from 'mobx';

// Stub — chart-modal isn't included in the standalone charts app (it's a
// workspace-embedded popup, not relevant here). chart.tsx still reads
// is_chart_modal_visible for a CSS class, so this stays permanently false.
export default class DashboardStore {
    is_chart_modal_visible = false;

    constructor() {
        makeObservable(this, {
            is_chart_modal_visible: observable,
            setChartModalVisibility: action,
        });
    }

    setChartModalVisibility(value = false) {
        this.is_chart_modal_visible = value;
    }
}
