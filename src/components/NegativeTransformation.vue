<template>
  <div class="space-y-8">
    <!-- Original Image + Inverted Image -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Original Image</CardTitle>
        </CardHeader>
        <CardContent>
          <img :src="originalImage" class="w-full rounded-lg object-cover" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Inverted Image</CardTitle>
        </CardHeader>
        <CardContent>
          <img v-if="!loading && invertedImage" :src="invertedImage" class="w-full rounded-lg object-cover" />
          <div v-else-if="loading" class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Loading...</p>
          </div>
          <div v-else class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Image not available</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Inverted Histogram -->
    <HistogramChart 
      v-if="invertedImage"
      :imageData="invertedImage" 
      title="Inverted Histogram"
      colorBackground="rgba(54, 162, 235, 0.6)"
      colorBorder="rgba(54, 162, 235, 1)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HistogramChart from '@/components/HistogramChart.vue';
import { invertImage } from '@/utils/imageUtils';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const loading = ref(false);
const invertedImage = ref(null);

const processImage = async () => {
  loading.value = true;
  invertedImage.value = await invertImage(props.originalImage);
  loading.value = false;
};

onMounted(processImage);

const handleSliderChange = async () => {
  await processImage();
};
</script>