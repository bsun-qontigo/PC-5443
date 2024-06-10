<template lang="pug">
.display-flex-column
    .display-flex-column.all-width.qontum-gap-sm
        .display-flex.align-items-baseline.justify-content-space-between
            .display-flex.flex-direction-column
                label.qontum-label-regular-md {{ handler.analysisDate && handler.analysisDate() }}
                .qontum-title-sm {{ handler.headerName() }}
    .flex-main-container.flex-grow.status-bar-top.marg-xxs(ref='body')
</template>