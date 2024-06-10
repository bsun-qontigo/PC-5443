<template lang="pug">
.display-flex-column.fill.qontum-chart-widget-container.padd-top-s.position-relative
    .histogram-chart-header.display-flex.align-items-center.position-absolute
        i.fa-solid.fa-chart-line-up.marg-right-xs.icon-s
        span {{ title }}
    .display-flex.all-height.all-width(ref='chart')
</template>    
<style lang="scss" scoped>
.histogram-chart-header {
    left: q-token(spacing-10);
    top: q-token(spacing-2);
    span {
        font-family: q-token(typography-label-semi-bold-sm-font-family);
        font-size: q-token(typography-label-semi-bold-sm-font-size);
        font-weight: q-token(typography-label-semi-bold-sm-font-weight);
        line-height: q-token(typography-label-semi-bold-sm-line-height);
    }
}
</style>