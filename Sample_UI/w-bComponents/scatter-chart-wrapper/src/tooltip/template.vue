<template lang="pug">
.display-flex.tooltip.tooltip-top
    .display-flex-column
        .display-flex.justify-content-space-between.gap-xss(v-if='handler?.id')
            label {{ $t("NAME") }}:
            label.bold {{ handler.id }}
        .display-flex.justify-content-space-between.gap-xss(v-if='handler?.axisX')
            label {{ handler?.axisX.name.value }}:
            label.bold {{ formatNumber(handler?.axisX) }}
        .display-flex.justify-content-space-between.gap-xss(v-if='handler?.axisY')
            label {{ handler?.axisY.name.value }}:
            label.bold {{ formatNumber(handler?.axisY) }}
</template>