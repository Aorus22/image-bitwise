<template>
  <div class="space-y-6">
    <!-- Sliders for Intensity Level Stretching -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">Intensity Min</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <Label class="text-sm font-medium">Min Value: {{ intensityMin }}</Label>
              <input
                type="range"
                v-model="intensityMin"
                min="0"
                max="255"
                step="1"
                class="w-full"
                @change="handleSliderChange"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">Intensity Max</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <Label class="text-sm font-medium">Max Value: {{ intensityMax }}</Label>
              <input
                type="range"
                v-model="intensityMax"
                min="0"
                max="255"
                step="1"
                class="w-full"
                @change="handleSliderChange"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Image Display -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Original Image -->
      <Card>
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Original Image</CardTitle>
        </CardHeader>
        <CardContent>
          <img v-if="originalImage" :src="originalImage" class="w-full rounded-lg object-cover" />
        </CardContent>
      </Card>

      <!-- Stretched Image -->
      <Card>
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Intensity Stretched Image</CardTitle>
        </CardHeader>
        <CardContent>
          <img v-if="!loading && stretchedImage" :src="stretchedImage" class="w-full rounded-lg object-cover" />
          <div v-else-if="loading" class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Loading...</p>
          </div>
          <div v-else class="w-full h-32 flex items-center justify-center">
            <p class="text-gray-500">Image not available</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Histogram Charts -->
    <HistogramChart v-if="stretchedImage" :imageData="stretchedImage" title="Intensity Stretched Histogram" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import HistogramChart from '@/components/HistogramChart.vue';
import { applyIntensityStretching } from '@/utils/imageUtils';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const loading = ref(false);
const stretchedImage = ref(null);
const intensityMin = ref(0);
const intensityMax = ref(255);

const processImage = async () => {
  loading.value = true;
  stretchedImage.value = await applyIntensityStretching(props.originalImage, intensityMin.value, intensityMax.value);
  loading.value = false;
};

onMounted(processImage);

const handleSliderChange = async () => {
  await processImage();
};
</script>
