import { Component, Vue, Prop, ChildHandler, OneWayExpectations } from '@axioma/vue';
import { Some } from '@axioma/core';
import VueTemplate from './template.vue';
import { SingleDropdown, SingleDropdownHandler } from '@axioma-framework/qontum';
import { Context } from '../grid/type';
import { fsSelectGroupBy } from '../utils/fsEvents';
import { GroupByKey, Nullable } from '@axioma/wealth-types';
import { plugins } from '@axioma/common';

export type GroupBySelectorExpectations = OneWayExpectations<{
    context: Context;
}, {
    changeGroupBy(e: Nullable<GroupByKey>): void
}>;

const NoneOption = { key: 'none', value: plugins.lang.t('PORTFOLIO_TABLE.NONE').toString(), name: 'none' } as const;

@Component({
    name: 'wealth-drilldown-groupby-selector',
    components: {
        SingleDropdown
    }
})
export default class GroupBySelector extends Vue.extend(VueTemplate) {

    @Prop()
    protected handler!: ChildHandler<GroupBySelectorExpectations>;

    @Prop()
    protected cssClass!: string;

    protected dropdownHandler = null as unknown as SingleDropdownHandler<{
        key: 'none' | GroupByKey,
        value: string;
        name?: string;
    }>;

    protected get showSelector(): boolean {
        return ((this.dropdownHandler?.list as unknown[])?.length || 0) > 1;
    }

    private get isDisabled(): boolean {
        return this.handler.context().gridType() === 'tradeList' || this.handler.context().gridLotsType() === 'taxLots';
    }

    protected created(): void {
        this.dropdownHandler = {
            autofocus: false,
            cleaneable: false,
            list: [],
            value: Some(NoneOption),
            disabled: this.isDisabled,
            options: () => ({
                format: i => i.value,
                key: i => i.key,
                type: 'other'
            }),
            onChange: str => {
                this.dropdownHandler.value = str.or(this.dropdownHandler.value);
                if (str.some) {
                    const selection = str.value;
                    if (selection.key === NoneOption.key) {
                        fsSelectGroupBy(null);
                        context.changeGroupBy(null);
                    } else {
                        fsSelectGroupBy(selection.name as Nullable<GroupByKey>);
                        context.changeGroupBy(selection.key);
                    }
                }
            }
        };
        const context = this.handler.context();
        this.$watch(context.portfolioData, async () => {
            const pf = await context.portfolioData();
            const classificationDTO = pf.classificationDTO ?? [];
            if (classificationDTO.length > 0) {
                this.dropdownHandler.list = [NoneOption, ...classificationDTO.map(c => ({ key: c.key, value: c.i18nKey, name: c.name }))];
            }
        });
        this.$watch(() => this.isDisabled, () => {
            this.dropdownHandler.disabled = this.isDisabled;
            if (this.dropdownHandler.disabled) {
                this.dropdownHandler.value = Some(NoneOption);
            }
        });
    }

}

