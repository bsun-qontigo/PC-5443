<template lang="pug">
.display-flex-column.fill
    .header.display-flex.qontum-gap-lg.marg-bottom-xs
        .display-flex-column
            label.qontum-label-regular-sm.qontum-global-foreground-weak-variant-color {{ $t('PORTFOLIO_NAME') }}
            label.qontum-label-bold-md.qontum-global-foreground-color.summary-value {{ portfolioName }}
        .display-flex-column
            label.qontum-label-regular-sm.qontum-global-foreground-weak-variant-color {{ $t('FINAL_MARKET_VALUE') }}
            label.qontum-label-bold-md.qontum-global-foreground-color.summary-value {{ marketValue }}
        .display-flex-column
            label.qontum-label-regular-sm.qontum-global-foreground-weak-variant-color {{ $t('BENCHMARK') }}
            label.qontum-label-bold-md.qontum-global-foreground-color.summary-value {{ benchmark }}
        .display-flex-column
            label.qontum-label-regular-sm.qontum-global-foreground-weak-variant-color {{ $t('STRATEGY_NAME') }}
            label.qontum-label-bold-md.qontum-global-foreground-color.summary-value {{ strategy }}
        .display-flex-column
            .qontum-divider-vertical.secondary.all-height    
        .display-flex-column
            label.qontum-label-regular-sm.qontum-global-foreground-weak-variant-color {{ $t('AS_OF') }}
            label.badge.qontum-label-regular-xs.item-as-of.summary-value {{ asOf }}
    .content.fill.display-flex.overflow-hidden
        .left.display-flex-column.all-height.flex-grow.marg-right-s.flex-grow
            .display-flex-column.fill
                PortfolioTimeSeriesWidget(:handler="portfolioTimeSeriesWidgetExpectations")
                PortfolioTable.portfolio-drill-in.overflow-hidden.fill.grid-stack-item-grid(
                        ref="portfolioTable",
                        :handler="portfolioTableExpectations"
                    )
        .right.display-flex-column.overflow-auto
            .wealth-lens.widget.padd-xs.position-relative.grid-stack-item-content(ref='wealthDrivers')
            .display-flex.wealth-sector-allocation.widget.padd-xs.sector-graph.position-relative.grid-stack-item-content(ref='wealthSectorAllocation')
            .wealth-top-10-holdings.widget.padd-xs.position-relative.grid-stack-item-content(ref='wealthTop10Holdings')

</template>
<style lang="scss" scoped>
.right {
    flex-basis: q-token(panel-sizing-sm-width);
}

.widget {
    background: q-token(data-grid-color-default);
}

.header {
    min-height: q-token(header-sizing-height-compressed);
}

.sector-graph {
    min-height: q-token(sizing-350);
}
</style>