<template>
  <div class="space-y-6">
    <!-- Log Control -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label for="log-slider" class="text-sm font-medium">Log Scale: {{ logScale }}</Label>
      </div>
      <div class="w-full">
        <input
          id="log-slider"
          type="range"
          v-model="logScale"
          min="1"
          max="100"
          step="1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          @change="handleSliderChange"
        />
      </div>
    </div>

    <!-- Original Image + Log Transformed Image -->
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
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Log Transformed Image</CardTitle>
        </CardHeader>
        <CardContent>
          <img v-if="logImage" :src="logImage" class="w-full rounded-lg object-cover" />
          <div v-else class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Processing...</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Histogram -->
    <HistogramChart 
      v-if="logImage"
      :imageData="logImage" 
      title="Log Adjusted Histogram"
      colorBackground="rgba(54, 162, 235, 0.6)"
      colorBorder="rgba(54, 162, 235, 1)"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import HistogramChart from '@/components/HistogramChart.vue';
import { applyLogTransformation } from '@/utils/imageUtils';
import { debounce } from 'lodash';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const logScale = ref(10);
const logImage = ref(null);

const processImage = async () => {
  logImage.value = await applyLogTransformation(props.originalImage, logScale.value);
}

onMounted(processImage);

const handleSliderChange = async () => {
  await processImage();
};

</script>
