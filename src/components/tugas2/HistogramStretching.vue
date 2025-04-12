<template>
  <div class="space-y-6">
    <!-- Sliders for RGB Min & Max -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(channel, index) in ['Red', 'Green', 'Blue']" :key="index">
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">{{ channel }} Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <!-- Min Slider -->
              <div>
                <Label class="text-sm font-medium">{{ channel }} Min: {{ rgbMin[index] }}</Label>
                <input
                  type="range"
                  v-model="rgbMin[index]"
                  min="0"
                  max="255"
                  step="1"
                  class="w-full"
                  @change="handleSliderChange"
                  :disabled="loading"
                />
              </div>

              <!-- Max Slider -->
              <div>
                <Label class="text-sm font-medium">{{ channel }} Max: {{ rgbMax[index] }}</Label>
                <input
                  type="range"
                  v-model="rgbMax[index]"
                  min="0"
                  max="255"
                  step="1"
                  class="w-full"
                  @change="handleSliderChange"
                  :disabled="loading"
                />
              </div>
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
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Stretched Image</CardTitle>
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
    <HistogramChart v-if="stretchedImage" :imageData="stretchedImage" title="Stretched Histogram" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import HistogramChart from '@/components/HistogramChart.vue';
import { performImageOperation } from '@/utils/imageUtils-1';
import { applyHistogramStretching } from '@/utils/imageUtils-2';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const loading = ref(false);
const stretchedImage = ref(null);
const rgbMin = ref([0, 0, 0]);
const rgbMax = ref([255, 255, 255]);

const processImage = async () => {
  loading.value = true;
  stretchedImage.value = await performImageOperation(() => applyHistogramStretching(props.originalImage, rgbMin.value, rgbMax.value));
  loading.value = false;
}

onMounted(processImage);

const handleSliderChange = async () => {
  await processImage();
};

</script>
