<template lang="pug">
.portfolio-time-series-chart.display-flex.flex-grow.justify-content-center.all-width.marg-bottom-s
    .flex-main-container.display-flex.qontum-gap-md.all-width(v-if="!loading")
        ToggleButton.display-flex-column.qontum-gap-lg(:handler="toggleButtonExpectations")
        .flex-main-container.display-flex.qontum-gap-md.all-width(v-if="!loading")
            TimeSeriesWidget.display-flex.qontum-gap-lg.wealth-time-series.grid-stack-item-content(:handler="AUMExpectations")
            TimeSeriesWidget.display-flex.qontum-gap-lg.wealth-time-series.grid-stack-item-content(:handler="trackingErrorExpectations")
            TimeSeriesWidget.display-flex.qontum-gap-lg.wealth-time-series.grid-stack-item-content(:handler="netTaxGainExpectations")
            TimeSeriesWidget.display-flex.qontum-gap-lg.wealth-time-series.grid-stack-item-content(:handler="netTaxLossExpectations")
</template>
<style lang="scss" scoped>
.wealth-time-series {
    min-height: q-token(sizing-170);
    max-height: q-token(sizing-200);
}
</style>