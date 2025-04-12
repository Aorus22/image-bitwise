<template>
  <div class="w-full min-h-screen flex flex-col justify-center items-center p-6 mx-auto space-y-8 bg-gray-50">
    <!-- Box Input -->
    <ImageUploader
      v-model:image="image"
      title="Edge Detection"
      :showButton=false
      :showGrayscaleButton=false
      description="Upload an image to apply edge detection techniques"
      @reset-processed-image="handleResetProcessedImage"
    />

    <div v-if="image" class="max-w-3xl space-y-8 w-full">
      <!-- Select Edge Detection Method -->
      <Card class="bg-white rounded-2xl">
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">Select Edge Detection Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Select v-model="selectedMethod">
            <SelectTrigger
              class="w-full p-3 border border-gray-300 bg-gray-100 rounded-2xl shadow-sm transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-300"
            >
              <SelectValue placeholder="Select an edge detection method" class="text-gray-700" />
            </SelectTrigger>
            <SelectContent class="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
              <SelectItem
                v-for="method in methods"
                :key="method.value"
                :value="method.value"
                class="p-3 cursor-pointer rounded-xl transition-all duration-200 data-[state=active]:bg-green-100 hover:bg-green-100"
              >
                {{ method.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <!-- Edge Detection Results -->
      <div v-if="edgeDetectedImage" class="space-y-8">
        <Card>
          <CardHeader class="pb-4">
            <CardTitle class="text-center text-lg font-semibold text-gray-800">Edge Detected Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img
            v-if="!loading"
            :src="edgeDetectedImage"
            class="w-full rounded-lg object-cover"
            />
            <div v-else class="w-full h-32 flex items-center justify-center">
              <p class="text-gray-500">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ImageUploader from '@/components/ImageUploader.vue';
import {
  applySobel,
  applyPrewitt,
  applyRoberts,
  applyLoG,
  applyKompas,
} from '@/utils/imageUtils-3';
import { performImageOperation } from '@/utils/imageUtils-1';

const image = ref(null);
const edgeDetectedImage = ref(null);
const selectedMethod = ref('');
const loading = ref(false);

const methods = [
  { value: 'sobel', label: 'Sobel' },
  { value: 'prewitt', label: 'Prewitt' },
  { value: 'roberts', label: 'Roberts' },
  { value: 'kompas', label: 'Kompas' },
  { value: 'log', label: 'Laplacian of Gaussian (LoG)' },
];

const handleResetProcessedImage = () => {
  edgeDetectedImage.value = null;
  selectedMethod.value = '';
};

const processEdgeDetection = async () => {
  if (!selectedMethod.value) return;

  loading.value = true;
  try {
    // switch (selectedMethod.value) {
    //   case 'sobel':
    //     edgeDetectedImage.value = await performImageOperation(() => applySobel(image.value));
    //     break;
    //   case 'prewitt':
    //     edgeDetectedImage.value = await performImageOperation(() => applyPrewitt(image.value));
    //     break;
    //   case 'roberts':
    //     edgeDetectedImage.value = await performImageOperation(() => applyRoberts(image.value));
    //     break;
    //   case 'kirsch':
    //     edgeDetectedImage.value = await performImageOperation(() => applyKirsch(image.value));
    //     break;
    //   case 'log':
    //     edgeDetectedImage.value = await performImageOperation(() => applyLoG(image.value));
    //     break;
    //   case 'kompas':
    //     edgeDetectedImage.value = await performImageOperation(() => applyKompas(image.value));
    //     break;
    //   default:
    //     edgeDetectedImage.value = null;
    // }
    switch (selectedMethod.value) {
      case 'sobel':
        edgeDetectedImage.value = await applySobel(image.value)
        break;
      case 'prewitt':
        edgeDetectedImage.value = await applyPrewitt(image.value)
        break;
      case 'roberts':
        edgeDetectedImage.value = await applyRoberts(image.value)
        break;
      case 'kirsch':
        edgeDetectedImage.value = await applyKirsch(image.value)
        break;
      case 'log':
        edgeDetectedImage.value = await applyLoG(image.value)
        break;
      case 'kompas':
        edgeDetectedImage.value = await applyKompas(image.value)
        break;
      default:
        edgeDetectedImage.value = null;
    }
  } catch (error) {
    console.error('Error applying edge detection:', error);
    edgeDetectedImage.value = null;
  } finally {
    loading.value = false;
  }
};


watch(selectedMethod, async (newValue, oldValue) => {
  if (newValue !== oldValue && image.value) {
    await processEdgeDetection();
  }
});
</script>