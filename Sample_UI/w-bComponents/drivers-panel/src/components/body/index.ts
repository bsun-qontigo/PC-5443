import { Vue, Component, Prop, Public, ChildHandler } from '@axioma/vue';
import VueTemplate from './template.vue';
import { GridApi, ColumnApi, GridReadyEvent } from '@axioma-types/grid-wrapper';
import { WealthLensColumn } from '@axioma/wealth-commons';
import { Debouncer } from '@axioma/core';
import { createGrid } from '../../grid';
import { WealthDriversPanelExpectations } from '../../';

export interface IWealthDriversBody {
    update(): void;
}

@Component({
    name: 'wealth-drivers-body',
    components: {

    }
})
export class WealthDriversBody extends Vue.extend(VueTemplate) {

    @Prop()
    protected handler!: ChildHandler<WealthDriversPanelExpectations>;

    public gridApi!: GridApi<WealthLensColumn.WealthLensDrivers>;
    protected gridReadyEvent!: Promise<GridReadyEvent<WealthLensColumn.WealthLensDrivers>>;
    protected columnApi!: ColumnApi;
    protected loading = false;
    private loader!: Debouncer;

    @Public()
    public update(): void {
        this.loadDrivers();
    }

    protected created(): void {
        this.loader = new Debouncer(150, this.loadDrivers);
    }

    protected mounted(): void {
        this.gridReadyEvent = createGrid(
            {
                context: this,
                elm: this.$refs['wealthDriversGrid'] as HTMLElement
            });
        this.gridReadyEvent.then(e => {
            this.gridApi = e.api;
            this.columnApi = e.columnApi;
        });
        this.$watch(this.handler.data, () => {
            if (!this.handler.loading()) {
                this.update();
            } else {
                this.gridReadyEvent.then(e => {
                    e.api.showLoadingOverlay();
                });
            }
        }, { immediate: true });
    }

    protected destroyed(): void {
        this.gridApi.destroy();
    }

    private loadDrivers(): void {
        this.gridReadyEvent.then(() => {
            this.gridApi.setRowData([]);
            this.gridApi.showLoadingOverlay();
            let data: WealthLensColumn.WealthLensDrivers[] = [];
            const subscores = this.handler?.data()?.analytics?.subscores;
            if (subscores) {
                data = Object.entries(subscores).map(([key, value]) => ({ key, value })) as WealthLensColumn.WealthLensDrivers[];
            }
            this.fillGrid(data);
        });
    }

    private fillGrid(data: WealthLensColumn.WealthLensDrivers[]): void {
        if (data.length > 0) {
            this.gridApi.hideOverlay();
            this.gridApi.setPinnedTopRowData([{ key: 'Overall', value: this.handler?.data().analytics?.healthScore }]);
            this.gridApi.setRowData(data);
        } else {
            this.gridApi.showNoRowsOverlay();
            this.gridApi.setPinnedTopRowData([{ key: 'Overall', value: null }]);
            this.gridApi.setRowData([]);
        }
    }

}