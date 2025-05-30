<template>
  <div class="space-y-6">
    <!-- Sliders for Contrast Stretching -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">Contrast Min</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <Label class="text-sm font-medium">Min Value: {{ contrastMin }}</Label>
              <input
                type="range"
                v-model="contrastMin"
                min="0"
                max="255"
                step="1"
                class="w-full"
                @change="handleSliderChange"
                :disabled="loading"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">Contrast Max</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <Label class="text-sm font-medium">Max Value: {{ contrastMax }}</Label>
              <input
                type="range"
                v-model="contrastMax"
                min="0"
                max="255"
                step="1"
                class="w-full"
                @change="handleSliderChange"
                :disabled="loading"
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
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Contrast Stretched Image</CardTitle>
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
    <HistogramChart v-if="stretchedImage" :imageData="stretchedImage" title="Contrast Stretched Histogram" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import HistogramChart from '@/components/HistogramChart.vue';
import { performImageOperation } from '@/utils/imageUtils-1';
import { applyContrastStretching } from '@/utils/imageUtils-2';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const loading = ref(false);
const stretchedImage = ref(null);
const contrastMin = ref(0);
const contrastMax = ref(255);

const processImage = async () => {
  loading.value = true;
  stretchedImage.value = await performImageOperation(() => applyContrastStretching(props.originalImage, contrastMin.value, contrastMax.value));
  loading.value = false;
};

onMounted(processImage);

const handleSliderChange = async () => {
  await processImage();
};
</script>
