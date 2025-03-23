<template>
  <div class="space-y-6">
    <!-- Gamma Control -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label for="gamma-slider" class="text-sm font-medium">Gamma Value: {{ gamma }}</Label>
      </div>
      <div class="w-full">
        <input
          id="gamma-slider"
          type="range"
          v-model="gamma"
          min="0.1"
          max="3"
          step="0.1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          @change="handleSliderChange"
          :disabled="loading"
        />
      </div>
    </div>

    <!-- Original Image + Gamma Transformed Image -->
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
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Gamma Transformed Image</CardTitle>
        </CardHeader>
        <CardContent>
          <img v-if="!loading && gammaImage" :src="gammaImage" class="w-full rounded-lg object-cover" />
          <div v-else-if="loading" class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Loading...</p>
          </div>
          <div v-else class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Image not available</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Histogram -->
    <HistogramChart 
      v-if="gammaImage"
      :imageData="gammaImage" 
      title="Gamma Adjusted Histogram"
      colorBackground="rgba(255, 99, 132, 0.6)"
      colorBorder="rgba(255, 99, 132, 1)"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import HistogramChart from '@/components/HistogramChart.vue';
import { applyGammaTransformation } from '@/utils/imageUtils-2';
import { debounce } from 'lodash';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const loading = ref(false);
const gamma = ref(1);
const gammaImage = ref(null);

const processImage = async () => {
  loading.value = true;
  gammaImage.value = await applyGammaTransformation(props.originalImage, gamma.value);
  loading.value = false;
}

onMounted(processImage);

const handleSliderChange = async () => {
  await processImage();
};

</script>
