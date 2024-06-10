<template lang="pug">
.display-flex.flex-grow.justify-content-center
    #tabs(ref="sidePanelContainer")
    .flex-main-container.flex-grow.status-bar-top.marg-xxs(ref="table")
</template>
<style lang="scss" scoped>
// need to fix these issues on gallery side;
::v-deep {
    .ag-row.has-error {
        box-shadow: inset q-token(sizing-4) 0 0 0 q-token(data-grid-color-fg) !important;
        -webkit-box-shadow: inset q-token(sizing-4) 0 0 0 q-token(data-grid-color-fg) !important;
    }
    .ag-status-bar-left {
        gap: q-token(data-grid-spacing-status-bar-padding);
        .qf-datepicker {
            width: q-token(date-picker-sizing-width-time);
            align-items: center;
        }
        .qontum-pill {
            max-width: fit-content;
        }
    }
    .ag-cell.batch-account-name {
        padding-right: 0;
        .ag-cell-wrapper {
            width: 100%;
            .ag-cell-value {
                width: 100%;
                padding-left: q-token(data-grid-spacing-cell-padding);
                padding-right: q-token(data-grid-spacing-cell-padding);
            }
        }
    }
    .ag-cell.batch-account-name.batch-is-compliance {
        .ag-cell-wrapper {
            .ag-cell-value .qontum-icon{
                color: q-token(button-color-warning-active);
            }
        }
    }
}
</style>