<template>
  <div class="w-full min-h-screen flex flex-col justify-center items-center p-6 mx-auto space-y-8 bg-gray-50">
    <!-- Box Input -->
    <ImageUploader 
      v-model:image="image" 
      v-model:useGrayscale="useGrayscale"
      @process-image="handleProcessImage"
      @reset-processed-image="handleResetProcessedImage"
    />

    <div v-if="processedImage" class="max-w-3xl space-y-8 w-full">
      <!-- Grayscale Image -->
      <Card v-if="useGrayscale">
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Grayscale Image</CardTitle>
        </CardHeader>
        <CardContent>
          <img :src="processedImage" class="w-full rounded-lg object-cover" />
        </CardContent>
      </Card>

      <!-- Histogram -->
      <HistogramChart :imageData="processedImage" title="Histogram" />

      <!-- Cumulative Histogram -->
      <CumulativeHistogramChart :imageData="processedImage" title="Cumulative Histogram" />

      <!-- Select Operation -->
      <Card class="bg-white rounded-2xl">
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Select Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <Select v-model="selectedOperation">
            <SelectTrigger class="w-full p-3 border border-gray-300 bg-gray-100 rounded-2xl shadow-sm transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-300">
              <SelectValue placeholder="Select an operation" class="text-gray-700" />
            </SelectTrigger>
            <SelectContent class="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
              <SelectItem 
                v-for="operation in operations" 
                :key="operation.value" 
                :value="operation.value" 
                class="p-3 cursor-pointer rounded-xl transition-all duration-200 data-[state=active]:bg-green-100 hover:bg-green-100"
              >
                {{ operation.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <!-- Dynamic Component Rendering -->
      <component 
        :is="selectedComponent" 
        v-if="selectedComponent" 
        :originalImage="processedImage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import ImageUploader from '@/components/ImageUploader.vue';
import HistogramChart from '@/components/HistogramChart.vue';
import CumulativeHistogramChart from '@/components/CumulativeHistogramChart.vue';
import EqualizedImage from '@/components/EqualizedImage.vue';
import InvertedImage from '@/components/InvertedImage.vue';
import GammaTransformedImage from '@/components/GammaTransformedImage.vue';
import BitPlaneSlicing from '@/components/BitPlaneSlicing.vue';

import { toGrayscale } from '@/utils/imageUtils';

const image = ref(null);
const useGrayscale = ref(false);
const processedImage = ref(null);
const selectedOperation = ref('');

const operations = [
  { value: 'invert', label: 'Invert Image', component: InvertedImage },
  { value: 'histogram-equalization', label: 'Histogram Equalization', component: EqualizedImage },
  { value: 'gamma', label: 'Gamma Transformation', component: GammaTransformedImage },
  { value: 'bit-plane-slicing', label: 'Bit Plane Slicing', component: BitPlaneSlicing }
];

const selectedComponent = computed(() => {
  const operation = operations.find(op => op.value === selectedOperation.value);
  return operation ? operation.component : null;
});

const handleResetProcessedImage = () => {
  processedImage.value = null;
  selectedOperation.value = '';
};

const handleProcessImage = async () => {
  if (useGrayscale.value) {
    processedImage.value = await toGrayscale(image.value);
  } else {
    processedImage.value = image.value;
  }
};

watch(useGrayscale, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleResetProcessedImage();
  }
});
</script>
