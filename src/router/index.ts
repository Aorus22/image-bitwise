import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ImageBitwise from '@/pages/ImageBitwise.vue'
import ImageHistogram from '@/pages/ImageHistogram.vue'

const routes: RouteRecordRaw[] = [
    { path: '/', redirect: () => '/image-bitwise' },
    { path: '/image-bitwise', component: ImageBitwise },
    { path: '/image-histogram', component: ImageHistogram }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
