<template lang="pug">
.display-flex.tooltip.tooltip-top
    .display-flex-column
        .display-flex.justify-content-space-between.gap-xss
            label {{ $t("RANGE") }}:
            label.bold [{{getFormat(min)}}, {{getFormat(max)}}]
        .display-flex.justify-content-space-between.gap-xss
            label {{ $t("COUNT") }}:
            label.bold {{ count }} 
</template>