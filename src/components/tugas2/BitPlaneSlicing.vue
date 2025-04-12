<template>
  <div class="space-y-6">
    <!-- Bit-Plane Control -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label for="bit-plane-slider" class="text-sm font-medium">
          Bit Plane: {{ bitPlane }}
        </Label>
      </div>
      <div class="w-full">
        <input
          id="bit-plane-slider"
          type="range"
          v-model="bitPlane"
          min="0"
          max="7"
          step="1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          @change="handleSliderChange"
        />
      </div>
    </div>

    <!-- Original Image + Bit-Plane Image -->
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
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Bit-Plane {{ bitPlane }}</CardTitle>
        </CardHeader>
        <CardContent>
          <img v-if="!loading && bitPlaneImage" :src="bitPlaneImage" class="w-full rounded-lg object-cover" />
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
      v-if="bitPlaneImage"
      :imageData="bitPlaneImage"
      title="Bit-Plane Histogram"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import HistogramChart from '@/components/HistogramChart.vue';
import { performImageOperation } from '@/utils/imageUtils-1';
import { applyBitPlaneSlicing } from '@/utils/imageUtils-2';

const props = defineProps({
  originalImage: {
    type: String,
    required: true
  }
});

const loading = ref(false);
const bitPlane = ref(0);
const bitPlaneImage = ref(null);

const processBitPlaneImage = async () => {
  loading.value = true;
  bitPlaneImage.value = await performImageOperation(() => applyBitPlaneSlicing(props.originalImage, bitPlane.value));
  loading.value = false;
}

onMounted(processBitPlaneImage);

const handleSliderChange = async () => {
  await processBitPlaneImage();
};

</script>
