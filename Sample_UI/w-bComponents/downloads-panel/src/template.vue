<template lang="pug">
.qontum-panel.size-md
    .title
        .display-flex-column.all-width
            .display-flex.justify-content-space-between.align-items-center.all-width.marg-bottom-xs
                .display-flex-column
                    .qontum-panel-title {{ $t('DOWNLOAD_PANEL.DOWNLOAD_PROGRESS') }}
                .display-flex
                    ButtonIcon.tertiary(:handler='handlerRefreshButtonIcon')
                    ButtonIcon.tertiary(:handler='handlerCloseButtonIcon')
    .body.display-flex
        .display-flex.flex-grow.justify-content-center
            .flex-main-container.flex-grow.status-bar-top.marg-xxs(ref="table")
</template>
<style lang="scss" scoped>
::v-deep .qontum-notification-body {
    word-break: break-word;
}
::v-deep .left-aligned .text-align-end {
    text-align: left !important;
}
</style>