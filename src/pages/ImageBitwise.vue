<template>
  <div class="w-full min-h-screen flex flex-col justify-center items-center p-6 mx-auto space-y-8 bg-gray-50">
    <!-- 1. Box Input -->
    <Card class="max-w-5xl w-full duration-300">
      <CardHeader class="pb-4">
        <CardTitle class="text-2xl font-bold text-gray-800">Image Bitwise Processor</CardTitle>
        <CardDescription class="text-gray-600">
          Upload two images to perform bitwise operations
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(img, index) in [image1, image2]" :key="index" class="relative space-y-2">
            <Label :for="'image' + (index + 1)">
              <div
                class="h-64 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden"
                :class="dragActive[index] ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'"
                @dragover.prevent="setDragActive(index, true)"
                @dragleave.prevent="setDragActive(index, false)"
                @drop.prevent="handleDrop($event, index)"
              >
                <template v-if="!img">
                  <UploadIcon class="h-10 w-10 text-gray-400 mb-3 transition-transform duration-300 hover:scale-110" />
                  <p class="text-sm text-gray-600">
                    <span class="font-semibold text-green-600">Click to upload</span> or drag and drop
                  </p>
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG</p>
                </template>
                <img v-else :src="img" class="h-full w-full object-contain rounded-lg" />
                <button
                  v-if="img"
                  class="absolute w-6 h-6 flex justify-center items-center top-3 right-3 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors duration-300"
                  @click.prevent="handleRemoveImage(index)"
                >
                  ✕
                </button>
              </div>
            </Label>
            <Input
              :id="'image' + (index + 1)"
              type="file"
              accept="image/*"
              class="hidden"
              @change="(e) => handleFileUpload(e, index)"
            />
          </div>
        </div>
        <Button
          v-if="image1 && image2"
          @click="handleConvertToGrayscale"
          class="w-full bg-[#159763] hover:bg-green-700 text-white py-3 rounded-lg transition-all duration-300"
        >
          Convert to Grayscale
        </Button>
      </CardContent>
    </Card>

    <!-- 2. Grayscale Images -->
    <div v-if="grayscale1 && grayscale2" class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full">
      <Card v-for="(src, index) in [grayscale1, grayscale2]" :key="index">
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">
            Grayscale Image {{ index + 1 }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <img :src="src" class="w-full rounded-lg object-cover" />
        </CardContent>
      </Card>
    </div>

    <!-- 3. Image Processing Options -->
    <Card v-if="grayscale1 && grayscale2" class="max-w-5xl w-full">
      <CardHeader class="pb-4">
        <div class="flex items-center justify-between">
          <CardTitle class="text-lg font-semibold text-gray-800">Image Processing Options</CardTitle>
          <div class="flex space-x-2">
            <Button
              @click="handleSelectAllOperations"
              class="bg-[#159763] hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
            >
              Select All
            </Button>
            <Button
              @click="handleDeselectAllOperations"
              class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all duration-300"
            >
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="op in operations" :key="op" class="flex items-center space-x-2">
            <input
              type="checkbox"
              :id="op"
              v-model="selectedOperations"
              :value="op"
              class="cursor-pointer h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label :for="op" class="cursor-pointer text-gray-700">{{ op }}</label>
          </div>
        </div>

        <Button
          v-if="grayscale1 && grayscale2 && selectedOperations.length"
          @click="handleProcessImages"
          class="w-full mt-6 bg-[#159763] hover:bg-green-700 text-white py-3 rounded-lg transition-all duration-300"
          :disabled="isProcessing"
        >
          {{ isProcessing ? 'Processing...' : 'Process Images' }}
        </Button>
      </CardContent>
    </Card>

    <!-- 4. Result Images -->
    <div v-if="Object.keys(resultImages).length" class="max-w-5xl w-full grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="(src, key) in resultImages" :key="key">
        <CardHeader class="pb-4">
          <CardTitle class="text-center text-lg font-semibold text-gray-800">{{ key }}</CardTitle>
        </CardHeader>
        <CardContent>
          <img :src="src" class="w-full rounded-lg object-cover" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadIcon } from 'lucide-vue-next';

import { toGrayscale, applyBitwiseOperation } from '@/utils/imageUtils-1';

const image1 = ref(null);
const image2 = ref(null);
const grayscale1 = ref(null);
const grayscale2 = ref(null);
const resultImages = ref({});
const isProcessing = ref(false);
const operations = ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR', 'NOT G1', 'NOT G2', 'G1 NOT G2', 'G2 NOT G1', 'Addition', 'Subtraction', 'Multiplication', 'Division'];
const selectedOperations = ref([]);

const dragActive = ref([false, false]);

const setDragActive = (index, value) => {
  dragActive.value[index] = value;
};

const handleDrop = (event, index) => {
  setDragActive(index, false);
  const file = event.dataTransfer.files[0];
  if (file) handleFileUpload({ target: { files: [file] } }, index);
};

const handleFileUpload = (event, index) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (index === 0) {
      image1.value = e.target.result;
    } else {
      image2.value = e.target.result;
    }
  };
  reader.readAsDataURL(file);
};

const handleRemoveImage = (index) => {
  if (index === 0) {
    image1.value = null;
  } else {
    image2.value = null;
  }
  grayscale1.value = null;
  grayscale2.value = null;
  resultImages.value = {};
};

const handleConvertToGrayscale = async () => {
  grayscale1.value = await toGrayscale(image1.value);
  grayscale2.value = await toGrayscale(image2.value);
};

const handleProcessImages = async () => {
  if (!grayscale1.value || !grayscale2.value || !selectedOperations.value.length) return;

  isProcessing.value = true;
  try {
    const results = {};
    for (const op of selectedOperations.value) {
      results[op] = await applyBitwiseOperation(grayscale1.value, grayscale2.value, op);
    }
    resultImages.value = results;
  } catch (error) {
    console.error('Error processing images:', error);
  } finally {
    isProcessing.value = false;
  }
};

const handleSelectAllOperations = () => {
  selectedOperations.value = [...operations];
};

const handleDeselectAllOperations = () => {
  selectedOperations.value = [];
};
</script>

<style scoped>
div[for^="image"] {
  transition: all 0.3s ease-in-out;
}

button {
  transition: all 0.3s ease-in-out;
}

input[type="checkbox"] {
  transition: all 0.3s ease-in-out;
}
</style>