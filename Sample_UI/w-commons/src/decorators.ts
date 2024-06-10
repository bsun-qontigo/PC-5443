import { TabClosing } from '@axioma-framework/layout';
import { Vue } from '@axioma/vue';

export const WealthTabClosing = function (target: unknown, key: unknown): void {
	TabClosing(target as Vue, key as string);
};