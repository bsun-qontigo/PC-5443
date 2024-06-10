<template lang="pug">
#header.display-flex.qontum-main-header.all-width
    #home.w-header-home.no-flex-shrink.cursor-pointer
        img.padd-lr-s(:src="logo", @click="showHome")
    #tabs.header-tabs.flex-main-container.all-height(ref="tabContainer")
    .toolbar.cursor-pointer(ref="userSettings")
        .padd-lr-s.no-flex-shrink.display-flex-column.align-items-center.justify-content-center(@click="onUploadClick")
            i.fa-arrow-up-to-line
            label.qontum-label-regular-md {{$t('UPLOAD')}}            
        #user-menu.header-user-menu.padd-left-s.no-flex-shrink(@click="onUserClick")
            i.fa-user
            .username.title {{ username }}
            i.qontum-icon.icon-down.fa-angle-down.size-lg
</template>