<template lang="pug">
.qontum-modal-body.disclaimer-agreement
	ModalHeader(:showCloseButton='false')
		label {{ $t('DISCLAIMER.EULA_UPDATED_TITLE') }}
	hr.qontum-divider.secondary
	.qontum-modal-content
		.content.padd-s.all-height(v-html='eula')
	hr.qontum-divider.secondary
	.qontum-modal-footer
		Button.tertiary.qf-decline.marg-right-xxs(:handler='handlerDeclineButton')
		Button.primary.qf-accept(:handler='handlerAcceptButton')
</template>