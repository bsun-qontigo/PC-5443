<template lang="pug">
#layout-manager.display-flex-column.flex-grow.fill.app-background
    .div(ref='root')
    #tabs(ref="downloadsContainer")
    .display-flex-column.fill
        .display-flex.all-width.ag-root-wrapper-body.align-items-center
            Tab(
                v-for="strat in strats",
                :handler="getTabHandler(strat)"
            ).margin-bottom-s
            ButtonIcon.marg-left-s(v-if='isMultipleDownload', :handler='handlerDownloadButtonIcon')
        .display-flex.fill.dashboards.overflow-hidden(ref='dashboards')
</template>