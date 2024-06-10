<template lang="pug">
.dashboard.display-flex-column.fill.marg-top-xs(
    :data-strategy="handler.strategyName()"
)
    .display-flex.fill.flex-main-container.overflow-hidden.overflow-x-auto(ref="container")
        .display-flex-column.left.fill.align-items-center.flex-main-container(
            ref="left"
        )
            .display-flex.flex-grow.all-width.padd-bottom-s.padd-right-s.gap-s.tiles
                Tile.link(:handler="procStatusHandler")
                Tile(v-for="metrics in keyMetrics", :key='metrics.key', :handler="metrics")
            .display-flex.flex-grow.all-width.padd-right-s.histogram-charts.qontum-gap-lg
                HistogramChartWidget.histogram-chart.grid-stack-item-content(:handler="trackingErrorExpectations")
                HistogramChartWidget.histogram-chart.grid-stack-item-content(:handler="realizedGainsExpectations")
                HistogramChartWidget.histogram-chart.grid-stack-item-content(:handler="turnoverExpectations")
            BatchResults.batch-results.overflow-hidden.fill.grid-stack-item-grid(
                ref="batchResults",
                :handler="batchResultsHandler"
            )
        .display-flex-column.right.overflow-y-auto(
            :style="rightPanelStyle"
        ) 
            ScatterPlot( :handler="scatterChartExpectations")
</template>
<style lang="scss" scoped>
.batch-results {
    padding-right: q-token(spacing-6) !important;
    margin-bottom:q-token(spacing-4) !important;
}
.histogram-charts {
    padding-bottom: q-token(spacing-6) !important;
}
.tiles {
    margin-left: q-token(sizing-1);
}
.histogram-chart {
    min-height: q-token(sizing-170);
    max-height: q-token(sizing-170);
}
</style>