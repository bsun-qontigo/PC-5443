import { Component, Vue, Inject, ParentHandler, createOneWayBinding } from '@axioma/vue';
import Template from './template.vue';
import { Option, Some } from '@axioma/core';
import { DateTime } from 'luxon';
import ProcessingStatus, { ProcessingStatusHandler } from '@axioma-components/wealth-processing-status';
import { TabItem } from '@axioma-framework/layout';
import { utils } from '@axioma/common';
import { wealthTaskClientRegistry } from '@axioma-api/wealth-task';

const { getDateTimeFromAPI } = utils.dateUtils;

@Component({
	appName: 'Wealth Processing Status',
	components: {
		ProcessingStatus
	}
})
export default class WealthProcessingStatus extends Vue.extend(Template) {
	@Inject()
	protected layoutTabItem!: TabItem;

	protected processingStatusHandler: ParentHandler<ProcessingStatusHandler> = createOneWayBinding<ProcessingStatusHandler>()
		.owned('date', null)
		.byRef('strategyName', () => undefined)
		.create();

	protected created(): void {
		wealthTaskClientRegistry.getUniqueStrategyNames().then(({ date }) => {
			const optionDate = (this.layoutTabItem.getState<Option<DateTime>>('date') ?? Some(getDateTimeFromAPI(date))) as Option<DateTime>;
			const strategyName = this.layoutTabItem.getState('strategyName') ?? '';
			if (optionDate.some) {
				this.processingStatusHandler = createOneWayBinding<ProcessingStatusHandler>()
					.owned('date', optionDate.value)
					.byRef('strategyName', strategyName)
					.create();
			}
		});
	}

}