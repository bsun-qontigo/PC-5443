<template lang="pug">
.display-flex-column.padd-marg-xs.download-menu
	.qontum-contextual-item.display-flex.qontum-menu-border-radius-bottom.padd-right-s(@click='onDownloadExcel')
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.size-lg
			span.qontum-contextual-item-label.qf-excelExport {{ $t('DOWNLOAD_MENU.DOWNLOAD_EXCEL') }}
	.qontum-contextual-item.display-flex.qontum-menu-border-radius-bottom.padd-right-s(@click='onMultipleDownloadExcel')
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.size-lg
			span.qontum-contextual-item-label.qf-excelExport {{ $t('DOWNLOAD_MENU.DOWNLOAD_ALL_EXCEL') }}
	hr
	.qontum-contextual-item.display-flex.qontum-menu-border-radius-bottom.padd-right-s(@click='onDownloadCsv')
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.size-lg
			span.qontum-contextual-item-label.qf-csvExport {{ $t('DOWNLOAD_MENU.DOWNLOAD_CSV') }}
	hr
	.qontum-contextual-item.display-flex.qontum-menu-border-radius-bottom.padd-right-s(@click='onDownloadWorkspace')
		.display-flex.align-items-center.qontum-contextual-item-frame
			i.qontum-icon.size-lg
			span.qontum-contextual-item-label.qf-workspace-export {{ $t('DOWNLOAD_MENU.DOWNLOAD_WORKSPACE') }}
</template>
