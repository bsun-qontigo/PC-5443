<template lang="pug">
.display-flex-column.flex-grow.padd-tb-xxs.d3-gauge-chart
  .qontum-title-sm.gauge-title {{ handler.chartOptions.title }}
  .all-width.flex-main-container.display-flex.marg-top-l(
    ref="chart"
  )
</template>

<style lang="scss" scoped>
.d3-gauge-chart {
  background: q-token(color-global-bg-base);
  max-height: q-token(sizing-400);
  position: relative;
  display: inline-block;
  .gauge-title {
    display: inline-block;
    position: absolute;
    vertical-align: top;
    left: q-token(sizing-25);
    top: q-token(sizing-25);
  }
}
</style>
