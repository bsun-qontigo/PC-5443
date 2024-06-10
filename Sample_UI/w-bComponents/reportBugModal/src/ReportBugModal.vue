<template lang="pug">
.qontum-modal-body
	ModalHeader(:showCloseButton='false', icon='fa-bug')
		label {{ $t('APP_COLLECTOR.TITLE') }}
	hr.qontum-divider.secondary
	.qontum-modal-content.display-flex-column(style='gap: 8px')
		.display-flex
			.qontum-label.align-self-center.flex-basis-15 {{ $t('APP_COLLECTOR.SUMMARY') }}
			Textfield(:handler='summaryHandler')
		.display-flex
			.qontum-label.align-self-center.flex-basis-15 {{ $t('DESCRIPTION') }}
			Textarea(:handler='descriptionHandler')
	hr.qontum-divider.secondary
	.qontum-modal-footer
		button.qontum.tertiary.marg-lr-xxs(@click='onCancel') {{ $t('CANCEL') }}
		button.qontum.primary.qf-save(
			@click='onSubmit',
			:disabled='cannotSubmit'
		) {{ $t('APP_COLLECTOR.SUBMIT') }}
</template>
