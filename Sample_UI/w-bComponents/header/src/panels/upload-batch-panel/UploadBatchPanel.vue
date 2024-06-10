<template lang="pug">
.qontum-panel.size-md
	.title
		.display-flex-column.all-width
			.display-flex.justify-content-space-between.align-items-center.all-width.marg-bottom-xs
				.qontum-panel-title  {{$t("BATCH_IMPORT.UPLOAD_FILE")}}
				ButtonIcon.tertiary(:handler='handlerCloseButtonIcon')
	.body.all-height.overflow-hidden
		.display-flex-column.marg-bottom-s.all-height
			.marg-xxs.all-height.display-flex-column
				#drop-zone.drop-zone.display-flex-column.align-items-center.radius-s.padd-m(
					ref='dropZone'
				)
					.qontum-label-regular-md {{ $t("BATCH_IMPORT.DROP_FILE") }}
					.qontum-label-regular-md {{ $t("BATCH_IMPORT.OR") }}
					input(
						type='file',
						ref='fileUpload',
						accept='.zip,.csv',
						multiple,
						@change='onFileInputChange',
						style='display: none'
					)
					Button.q-button.primary.marg-top-xxs(:handler='handlerBrowseButton')
				.display-flex.flex-grow.justify-content-center.overflow-hidden.fill.marg-top-s
					.flex-main-container.flex-grow.status-bar-top(ref="table")
	.footer
		.display-flex-column.all-width
			hr.qontum-divider.secondary.marg-tb-xs
			.display-flex.justify-content-space-between
				.qontum-label.align-self-center.display-flex.all-width.justify-content-end
					Button.save.qf-save.secondary.size-md(:handler='handlerCloseButton')
</template>

<style lang="scss" scoped>
.drop-zone {
	outline: q-token(sizing-1) dashed q-token(color-interactive-primary-default); 
	background: q-token(color-global-bg-base);
}
.drop-active {
	outline-width: q-token(sizing-2);
}

::v-deep .upload-filename-column:hover {
	background-color: q-token(data-grid-color-hover) !important;
}
</style>
