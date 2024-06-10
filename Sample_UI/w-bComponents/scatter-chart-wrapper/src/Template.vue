<template lang="pug">
.display-flex-column.all-width.wealth-scatter-chart.position-relative
  .chart.position-relative
      ChartWidget(:handler='chartWidgetHandler')
  .pickers.display-flex.qontum-gap-md.position-absolute.top-left
      SingleDropdown(:handler='xAxisSelectHandler')
      .by.display-flex.align-items-center.justify-content-center {{ $t('BY').toString().toLowerCase() }}
      SingleDropdown(:handler='yAxisSelectHandler')    
</template>
<style lang="scss" scoped>
.wealth-scatter-chart {
  background-color: q-token(color-global-surface-base);
}
.scatter-container {
  max-width: unset;
  margin: auto;
  min-height: q-token(sizing-400);
}
.chart-header {
  left: q-token(spacing-14);
  top: q-token(spacing-6);
  span {
    font-family: q-token(typography-label-bold-sm-font-family), sans-serif;
    font-size: q-token(typography-label-bold-sm-font-size);
    line-height: q-token(typography-label-bold-sm-line-height);
    font-weight: q-token(typography-label-bold-sm-font-weight);
  }
}
.by {
	font-size: q-token(typography-label-semi-bold-md-font-size);
	font-weight: q-token(typography-label-semi-bold-md-font-weight);
}
.pickers.top-left {
    top: 0;
    left: 0;
    padding-top: q-token(spacing-2);
    padding-left: q-token(spacing-2);
}
</style>