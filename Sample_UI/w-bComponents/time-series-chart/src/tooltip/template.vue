<template lang="pug">
.display-flex.tooltip.tooltip-top
	.display-flex-column
		.display-flex.justify-content-space-between.gap-xss(v-if='isTimeSeries')
			label {{ $t("DATE") }}:
			label.bold {{  getDate }}
		.display-flex.justify-content-space-between.gap-xss(v-else)
			label {{ axis?.legend }}: 
			label.bold {{ getFormat(axis?.value) }}
		.display-flex.justify-content-space-between.gap-xss
			label.bold(v-for='serie in series') {{ serie?.value ? getFormat(serie.value) : '-' }}
</template>