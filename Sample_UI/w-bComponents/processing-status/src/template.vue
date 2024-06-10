<template lang="pug">
.display-flex-column.fill.grid-row-table
    #tabs(ref="sidePanelContainer")
    .flex-main-container.flex-grow.status-bar-top(ref="status")
    .panel.display-flex-column.flex-main-container.flex-grow.marg-left-xs(
        v-show="showErrorGrid"
    )
        .qontum-title-sm.marg-bottom-xs.marg-top-xs {{ batchId }}
        .flex-main-container.flex-grow.all-width(ref="error") 
</template>
