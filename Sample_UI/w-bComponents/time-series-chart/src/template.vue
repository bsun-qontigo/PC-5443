<template lang="pug">
.display-flex-column.qontum-chart-widget-container
    .display-flex.all-width.flex-grow.align-items-center.flex-main-container.justify-content-space-between.padd-lr-xs.padd-top-xs
        label.qontum-label-regular-md {{ label }}
        label.qontum-title-md {{ sublabel }}
    .display-flex.all-height.all-width(ref='chart')
</template>