<template lang="pug">
.display-flex-column.all-width.gap-s.padd-s
    Button.primary(:handler='buttonHandler')
    Textfield(:handler='textFieldHandler')
    span {{ date }}
    span(v-for="s in strategies") {{ s }}
    span {{ uploadStatus }}
</template>
