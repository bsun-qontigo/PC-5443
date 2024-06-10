<template lang="pug">
.display-flex.tooltip.adjust-z-index.tooltip-top
	.display-flex.justify-content-space-between.gap-xss
		label {{ getAxis }}: 
		label.bold {{ getFormat(value) }}
</template>
<style lang="scss" scoped>
.adjust-z-index{
	z-index: 101;
}
</style>