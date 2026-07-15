import ChartStore from './chart-store';
import ClientStore from './client-store';
import CommonStore from './common-store';
import DashboardStore from './dashboard-store';
import RunPanelStore from './run-panel-store';
import UiStore from './ui-store';

export default class RootStore {
    client: ClientStore;
    common: CommonStore;
    ui: UiStore;
    dashboard: DashboardStore;
    run_panel: RunPanelStore;
    chart_store: ChartStore;

    constructor() {
        this.client = new ClientStore();
        this.common = new CommonStore();
        this.ui = new UiStore();
        this.dashboard = new DashboardStore();
        this.run_panel = new RunPanelStore();
        this.chart_store = new ChartStore(this);
    }
}
