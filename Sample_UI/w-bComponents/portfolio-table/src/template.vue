<template lang="pug">
.display-flex.flex-grow.justify-content-center
  .flex-main-container.flex-grow.status-bar-top(ref="table")
</template>
<style lang="scss">
.portfolio-tab-container
  .ag-status-bar
  .qontum-toggle-button-container:last-child {
  --ag-status-bar-left-gap: q-token(spacing-6);
  margin-left: q-token(spacing-14);
}
</style>
