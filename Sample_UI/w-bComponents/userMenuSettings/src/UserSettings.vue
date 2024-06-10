<template lang="pug">
.display-flex-column.padd-marg-xs.user-menu
	.qontum-contextual-item.display-flex.qontum-menu-border-radius-bottom.report-a-bug(
		@click='onReportBug', 
		v-if='isAxiomaUser'
		)
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.fa-bug.size-lg
			span.qontum-contextual-item-label.report-bug {{ $t('REPORT_BUG') }}
	hr.qontum-divider.secondary
	.qontum-contextual-item.user-settings(@click.stop='onSettingsClicked')
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.fa-user-gear.size-lg
			span.qontum-contextual-item-label.user-settings {{ $t('USER_SETTINGS') }}
	hr.qontum-divider.secondary
	.qontum-contextual-item.processing-status(@click.stop='onProcessingStatusClicked')
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.fa-circle-info.size-lg
			span.qontum-contextual-item-label.processing-status {{ $t('PROCESSING_STATUS') }}
	hr.qontum-divider.secondary
	.qontum-contextual-item.display-flex.qontum-menu-border-radius-bottom.logout(@click='logout')
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.fa-sign-out.size-lg(:title='"Logout"')
			span.qontum-contextual-item-label.logout {{ $t('LOGOUT') }}
</template>