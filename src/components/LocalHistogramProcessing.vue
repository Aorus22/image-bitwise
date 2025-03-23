<template>
  <div class="space-y-6">
    <!-- Window Size Control -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label for="window-slider" class="text-sm font-medium">Window Size: {{ windowSize }}</Label>
      </div>
      <div class="w-full">
        <input
          id="window-slider"
          type="range"
          v-model="windowSize"
          min="3"
          max="21"
          step="2"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          @change="handleSliderChange"
        />
      </div>
    </div>

    <!-- Original Image + Processed Image -->
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
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Local Histogram Processed</CardTitle>
        </CardHeader>
        <CardContent>
          <img v-if="processedImage" :src="processedImage" class="w-full rounded-lg object-cover" />
          <div v-else class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Processing...</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Histogram -->
    <HistogramChart 
      v-if="processedImage"
      :imageData="processedImage" 
      title="Local Histogram Processed"
      colorBackground="rgba(255, 159, 64, 0.6)"
      colorBorder="rgba(255, 159, 64, 1)"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import HistogramChart from '@/components/HistogramChart.vue';
import { applyLocalHistogramEqualization } from '@/utils/imageUtils';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const windowSize = ref(9);
const processedImage = ref(null);

const processImage = async () => {
  processedImage.value = await applyLocalHistogramEqualization(props.originalImage, windowSize.value);
}

onMounted(processImage);

const handleSliderChange = async () => {
  await processImage();
};

</script>
