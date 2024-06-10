<template lang="pug">
.display-flex.fill
    .display-flex-column.flex-grow.processing-status-container.padd-lr-xs
        ProcessingStatus(:handler="processingStatusHandler") 
</template>