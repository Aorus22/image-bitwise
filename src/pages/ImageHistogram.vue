<template>
  <div class="w-full min-h-screen flex flex-col justify-center items-center p-6 mx-auto space-y-8 bg-gray-50">
    <!-- Box Input -->
    <Card class="max-w-3xl w-full duration-300">
      <CardHeader class="pb-4">
        <CardTitle class="text-2xl font-bold text-gray-800">Image Histogram Analyzer</CardTitle>
        <CardDescription class="text-gray-600">
          Upload an image to generate its histogram
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="relative">
          <Label for="imageUpload">
            <div
              class="h-64 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden"
              :class="dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'"
              @dragover.prevent="dragActive = true"
              @dragleave.prevent="dragActive = false"
              @drop.prevent="handleDrop"
            >
              <template v-if="!image">
                <UploadIcon class="h-10 w-10 text-gray-400 mb-3 transition-transform duration-300 hover:scale-110" />
                <p class="text-sm text-gray-600">
                  <span class="font-semibold text-green-600">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 5MB)</p>
              </template>
              <img v-else :src="image" class="h-full w-full object-contain rounded-lg" />
              <button
                v-if="image"
                class="absolute w-6 h-6 flex justify-center items-center top-3 right-3 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors duration-300"
                @click.prevent="handleRemoveImage"
              >
                ✕
              </button>
            </div>
          </Label>
          <Input id="imageUpload" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            :id="grayscale"
            v-model="useGrayscale"
            :value="useGrayscale"
            @change="handleImageProcess"
            class="cursor-pointer h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <Label for="grayscaleCheckbox" class="text-gray-700">
            Convert to Grayscale First
          </Label>
        </div>

        <Button
          v-if="image"
          @click="handleProcessImage"
          class="w-full bg-[#159763] hover:bg-green-700 text-white py-3 rounded-lg transition-all duration-300"
        >
          Show Histogram
        </Button>
      </CardContent>
    </Card>

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
      <Card>
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Histogram</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas ref="histogramCanvas"></canvas>
        </CardContent>
      </Card>

      <!-- Cumulative Histogram -->
      <Card>
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Cumulative Histogram</CardTitle>
        </CardHeader>
        <CardContent>
          <canvas ref="cumulativeHistogramCanvas" class="w-full h-64"></canvas>
        </CardContent>
      </Card>

      <!-- Select Operation -->
      <Card class="bg-white rounded-2xl">
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Select Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <Select v-model="selectedOperation" @update:modelValue="handleOperationChange">
            <SelectTrigger class="w-full p-3 border border-gray-300 bg-gray-100 rounded-2xl shadow-sm transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-300">
              <SelectValue placeholder="Select an operation" class="text-gray-700" />
            </SelectTrigger>
            <SelectContent class="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
              <SelectItem value="invert" class="p-3 cursor-pointer rounded-xl transition-all duration-200 data-[state=active]:bg-green-100 hover:bg-green-100">
                Invert Image
              </SelectItem>
              <SelectItem value="histogramEqualization" class="p-3 cursor-pointer rounded-xl transition-all duration-200 data-[state=active]:bg-green-100 hover:bg-green-100">
                Histogram Equalization
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <!-- Histogram Equalization -->
      <div v-if="selectedOperation === 'histogramEqualization' && equalizedImage" class="space-y-8">
        <!-- Original Image + Equalized Image -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader class="pb-4">
              <CardTitle class="text-center text-lg font-semibold text-gray-800">Original Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img :src="processedImage" class="w-full rounded-lg object-cover" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-4">
              <CardTitle class="text-center text-lg font-semibold text-gray-800">Equalized Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img :src="equalizedImage" class="w-full rounded-lg object-cover" />
            </CardContent>
          </Card>
        </div>

        <!-- Equalized Histogram -->
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">Equalized Histogram</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref="equalizedHistogramCanvas"></canvas>
          </CardContent>
        </Card>
      </div>

      <div v-else-if="selectedOperation === 'invert' && invertedImage" class="space-y-8">
        <!-- Original Image + Inverted Image -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader class="pb-4">
              <CardTitle class="text-center text-lg font-semibold text-gray-800">Original Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img :src="processedImage" class="w-full rounded-lg object-cover" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-4">
              <CardTitle class="text-center text-lg font-semibold text-gray-800">Inverted Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img :src="invertedImage" class="w-full rounded-lg object-cover" />
            </CardContent>
          </Card>
        </div>

        <!-- Inverted Histogram -->
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">Inverted Histogram</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas ref="invertedHistogramCanvas"></canvas>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadIcon } from 'lucide-vue-next';

import { toGrayscale, invertImage, applyHistogramEqualization, drawHistogram, drawCumulativeHistogram } from '@/utils/imageUtils';

const image = ref(null);
const useGrayscale = ref(false);
const processedImage = ref(null);
const equalizedImage = ref(null);
const invertedImage = ref(null);
const dragActive = ref(false);
const histogramCanvas = ref(null);
const cumulativeHistogramCanvas = ref(null);
const equalizedHistogramCanvas = ref(null);
const invertedHistogramCanvas = ref(null);

const selectedOperation = ref('');
let histogramChartInstance = null;
let equalizedHistogramChartInstance = null;
let cumulativeHistogramChartInstance = null;
let invertedHistogramChartInstance = null;

const handleDrop = (event) => {
  dragActive.value = false;
  const file = event.dataTransfer.files[0];
  if (file) handleFileUpload({ target: { files: [file] } });
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
    return;
  }
  if (file.size > 100 * 1024 * 1024) {
    alert('File size exceeds 5MB. Please upload a smaller image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    image.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleResetProcessedImage = () => {
  processedImage.value = null;
  equalizedImage.value = null;
  selectedOperation.value = '';
  if (histogramChartInstance) histogramChartInstance.destroy();
  if (equalizedHistogramChartInstance) equalizedHistogramChartInstance.destroy();
  if (cumulativeHistogramChartInstance) cumulativeHistogramChartInstance.destroy();
}

const handleRemoveImage = () => {
  image.value = null;
  handleResetProcessedImage();
};

const handleProcessImage = async () => {
  processedImage.value = image.value;

  if (useGrayscale.value) {
    processedImage.value = await toGrayscale(image.value);
  }

  await nextTick();
  drawHistogram(
    processedImage.value,
    histogramCanvas.value,
    histogramChartInstance,
    'Pixel Intensity',
    'rgba(75, 192, 192, 0.6)',
    'rgba(75, 192, 192, 1)'
  );
  drawCumulativeHistogram(
    processedImage.value,
    cumulativeHistogramCanvas.value,
    cumulativeHistogramChartInstance
  );
};

const handleOperationChange = async () => {
  if (!processedImage.value) {
    return;
  }

  if (selectedOperation.value === 'histogramEqualization') {
    equalizedImage.value = await applyHistogramEqualization(processedImage.value);
    await nextTick();
    drawHistogram(
      equalizedImage.value,
      equalizedHistogramCanvas.value,
      equalizedHistogramChartInstance,
      'Pixel Intensity (Equalized)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(54, 162, 235, 1)'
    );
  } else if (selectedOperation.value === 'invert') {
    invertedImage.value = await invertImage(processedImage.value);
    await nextTick();
    drawHistogram(
      invertedImage.value,
      invertedHistogramCanvas.value,
      invertedHistogramChartInstance,
      'Pixel Intensity (Equalized)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(54, 162, 235, 1)'
    );
  }
};

watch(useGrayscale, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleResetProcessedImage();
  }
});

</script>

<style scoped>
div[for="imageUpload"] {
  transition: all 0.3s ease-in-out;
}

button {
  transition: all 0.3s ease-in-out;
}

select {
  transition: all 0.3s ease-in-out;
}

canvas {
  width: 100%;
  height: 300px;
}
</style>