<template lang="pug">
.display-flex.flex-grow.justify-content-center.align-items-center.gap-xxs(v-show="showSelector" :class="cssClass")
    h2.header {{ $t('PORTFOLIO_TABLE.GROUP_BY').toString() }}
    SingleDropdown(v-if="showSelector" :handler="dropdownHandler")
</template>
<style lang="scss" scoped>
.header {
    color: q-token(color-global-fg-weak);
    font-family: q-token(micro-widget-typography-title-font-family), sans-serif;
    font-size: q-token(micro-widget-typography-title-font-size);
    line-height: q-token(micro-widget-typography-title-line-height);
    font-weight: q-token(micro-widget-typography-title-font-weight);
}
</style>
