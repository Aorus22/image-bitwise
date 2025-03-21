<script setup>
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, Image, BarChart2 } from 'lucide-vue-next';

const isOpen = ref(false);
const route = useRoute();

const menuItems = [
  { path: '/image-bitwise', label: 'Image Bitwise', icon: Image },
  { path: '/image-histogram', label: 'Image Histogram', icon: BarChart2 },
];

const isActive = (path) => route.path === path;
</script>

<template>
  <div>
    <!-- Desktop Sidebar -->
    <aside class="h-screen hidden md:flex sticky top-0 z-20 flex-col w-64 bg-gradient-to-b from-gray-50 to-white border-r shadow-lg">
      <div class="py-6 px-4">
        <div class="flex items-center justify-between mb-8 px-2">
          <h2 class="text-2xl font-bold tracking-tight text-gray-800">Image Tools</h2>
        </div>
        <ScrollArea class="flex-1 h-[calc(100vh-12rem)]">
          <nav class="grid gap-2 px-2">
            <RouterLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              :class="[
                'relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300',
                isActive(item.path)
                  ? 'bg-green-100 text-green-800 shadow-sm'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-700 hover:shadow-md'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" :class="isActive(item.path) ? 'text-green-600' : 'text-gray-500'" />
              <span>{{ item.label }}</span>
              <span
                v-if="isActive(item.path)"
                class="absolute left-0 top-0 h-full w-1 bg-green-600 rounded-r"
              ></span>
            </RouterLink>
          </nav>
        </ScrollArea>
      </div>
    </aside>

    <!-- Mobile Menu Sheet -->
    <Sheet v-model:open="isOpen">
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          class="border-none md:hidden fixed top-4 left-4 z-40 bg-white shadow-md hover:bg-green-50 transition-colors duration-300"
        >
          <Menu class="h-5 w-5 text-gray-600" />
          <span class="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" class="w-64 p-0 bg-gradient-to-b from-gray-50 to-white">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold tracking-tight text-gray-800">Image Tools</h2>
          </div>
          <nav class="grid gap-2">
            <RouterLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              :class="[
                'relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300',
                isActive(item.path)
                  ? 'bg-green-100 text-green-800 shadow-sm'
                  : 'text-gray-600 hover:bg-green-50 hover:text-green-700 hover:shadow-md'
              ]"
              @click="isOpen = false"
            >
              <component :is="item.icon" class="w-5 h-5" :class="isActive(item.path) ? 'text-green-600' : 'text-gray-500'" />
              <span>{{ item.label }}</span>
              <span
                v-if="isActive(item.path)"
                class="absolute left-0 top-0 h-full w-1 bg-green-600 rounded-r"
              ></span>
            </RouterLink>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

<style scoped>
nav a:hover {
  transform: translateX(4px);
}

nav a span {
  transition: all 0.3s ease-in-out;
}
</style>