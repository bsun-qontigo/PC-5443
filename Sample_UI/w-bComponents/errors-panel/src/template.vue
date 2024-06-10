<template lang="pug">
.qontum-panel.size-sm
    .title
        .display-flex-column.all-width
            .display-flex.justify-content-space-between.align-items-center.all-width.marg-bottom-xs
                .display-flex-column
                    label.qontum-label-regular-md {{ handler.analysisDate }}
                    .qontum-panel-title {{ handler.headerName }}
                ButtonIcon.tertiary(:handler='handlerCloseButtonIcon')
            .display-flex
                Banner.all-width(v-if='handlerBanner.title', :handler='handlerBanner')
    .body
        .display-flex-column.marg-bottom-s 
            .display-flex.marg-bottom-xs(v-for="handler in notificationHandlers")
                StandardNotification.flex-grow(:handler='handler')
    .footer
        .display-flex-column.all-width
            hr.qontum-divider.secondary.marg-tb-xs
            .display-flex.justify-content-space-between
                .qontum-label.align-self-center.display-flex.all-width
                .display-flex
                    Button.cancel.qf-cancel.secondary.size-md.marg-right-xs(:handler='handlerCancelButton')
</template>
<style lang="scss" scoped>
::v-deep .qontum-notification-body {
    word-break: break-word;
}
</style>