<template lang="pug">
.display-flex-column
    .display-flex-column.all-width.qontum-gap-sm
        .display-flex.align-items-baseline.justify-content-space-between
            .display-flex.align-items-center.qontum-gap-md
                .qontum-title-sm {{$t('TOP_10_HOLDINGS')}}
                SpaceViewSelector(v-show='!handler.loading()' :handler='spaceViewSelectorHandler')
    .flex-main-container.flex-grow.status-bar-top.marg-xxs(ref="table")
</template>