<template>
  <div class="w-screen min-h-screen flex flex-col justify-center items-center p-6 mx-auto space-y-6">
    <Card class="max-w-5xl w-full">
      <CardHeader>
        <CardTitle>Image Bitwise Processor</CardTitle>
        <CardDescription>Upload two images to perform bitwise operations</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(img, index) in [image1, image2]" :key="index" class="relative space-y-2">
            <Label :for="'image' + (index + 1)">
              <div
                class="h-48 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative"
                :class="dragActive[index] ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'"
                @dragover.prevent="setDragActive(index, true)"
                @dragleave.prevent="setDragActive(index, false)"
                @drop.prevent="handleDrop($event, index)"
              >
                <template v-if="!img">
                  <UploadIcon class="h-8 w-8 text-gray-400 mb-2" />
                  <p class="text-sm text-gray-500">
                    <span class="font-semibold text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p class="text-xs text-gray-400">PNG, JPG, JPEG</p>
                </template>
                <img v-else :src="img" class="h-full w-full object-contain rounded-lg" />
                <button 
                  v-if="img"
                  class="absolute w-5 h-5 flex justify-center items-center top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                  @click.prevent="removeImage(index)"
                >&#10005;</button>
              </div>
            </Label>
            <Input 
              :id="'image' + (index+1)" 
              type="file" 
              accept="image/*" 
              class="hidden"
              @change="(e) => handleFileUpload(e, index)" 
            />
          </div>
        </div>
        <Button v-if="image1 && image2" @click="convertToGrayscale" class="w-full">Convert to Grayscale</Button>
      </CardContent>
    </Card>


    <div v-if="grayscale1 && grayscale2" class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
      <Card v-for="(src, index) in [grayscale1, grayscale2]" :key="index">
        <CardHeader>
          <CardTitle class="text-center text-sm">Grayscale Image {{ index + 1 }}</CardTitle>
        </CardHeader>
        <CardContent>
          <img :src="src" class="w-full rounded-lg object-cover" />
        </CardContent>
      </Card>
    </div>

    <Card v-if="grayscale1 && grayscale2" class="p-4 max-w-5xl w-full">
      <CardHeader class="flex justify-between items-center">
        <CardTitle>Image Processing Options</CardTitle>
        <div class="flex space-x-2">
          <Button @click="selectAllOperations">Select All</Button>
          <Button @click="deselectAllOperations">Deselect All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="op in operations" :key="op" class="flex items-center space-x-2">
            <input type="checkbox" :id="op" v-model="selectedOperations" :value="op" class="cursor-pointer" />
            <label :for="op" class="cursor-pointer">{{ op }}</label>
          </div>
        </div>

        <Button v-if="grayscale1 && grayscale2 && selectedOperations.length" @click="processImages" class="w-full mt-4">
          {{ isProcessing ? 'Processing...' : 'Process Images' }}
        </Button>
      </CardContent>
    </Card>

    <div v-if="Object.keys(resultImages).length" class="max-w-5xl grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="(src, key) in resultImages" :key="key">
        <CardHeader><CardTitle class="text-center text-sm">{{ key }}</CardTitle></CardHeader>
        <CardContent><img :src="src" class="w-full rounded-lg object-cover" /></CardContent>
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

const image1 = ref(null);
const image2 = ref(null);
const grayscale1 = ref(null);
const grayscale2 = ref(null);
const resultImages = ref({});
const isProcessing = ref(false);
const operations = ['AND', 'OR', 'XOR', 'XNOR', 'G1 NOT G2', 'G2 NOT G1', 'NAND', 'NOR', 'NOT G1', 'NOT G2', 'Addition', 'Subtraction', 'Multiplication', 'Division'];
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

const removeImage = (index) => {
  if (index === 0) {
    image1.value = null;
  } else {
    image2.value = null;
  }
};

const convertToGrayscale = async () => {
  grayscale1.value = await toGrayscale(image1.value);
  grayscale2.value = await toGrayscale(image2.value);
};

const toGrayscale = (image) => {
  return new Promise((resolve, reject) => {
    if (!image) {
      reject(new Error('Image source is null or undefined'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = image;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        imageData.data[i] = avg;
        imageData.data[i + 1] = avg;
        imageData.data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = (err) => {
      reject(new Error('Error loading image'));
    };
  });
};

const processImages = async () => {
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

const applyBitwiseOperation = async (img1, img2, operation) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const image1 = new Image();
  const image2 = new Image();
  image1.src = img1;
  image2.src = img2;

  await new Promise((resolve) => {
    let loaded = 0;
    const checkLoaded = () => {
      loaded++;
      if (loaded === 2) resolve();
    };
    image1.onload = checkLoaded;
    image2.onload = checkLoaded;
  });

  const width = Math.min(image1.width, image2.width);
  const height = Math.min(image1.height, image2.height);
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image1, 0, 0, width, height);
  const data1 = ctx.getImageData(0, 0, width, height);
  ctx.drawImage(image2, 0, 0, width, height);
  const data2 = ctx.getImageData(0, 0, width, height);

  const resultData = ctx.createImageData(width, height);

  for (let i = 0; i < data1.data.length; i += 4) {
    const val1 = data1.data[i];
    const val2 = data2.data[i];
    let result;
    switch(operation) {
      case 'AND':
        result = val1 & val2;
        break;
      case 'OR':
        result = val1 | val2;
        break;
      case 'XOR':
        result = val1 ^ val2;
        break;
      case 'XNOR':
        result = 255 - (val1 ^ val2);
        break;
      case 'G1 NOT G2':
        result = val1 & (255 - val2);
        break;
      case 'G2 NOT G1':
        result = val2 & (255 - val1);
        break;
      case 'NAND':
        result = 255 - (val1 & val2);
        break;
      case 'NOR':
        result = 255 - (val1 | val2);
        break;
      case 'NOT G1':
        result = 255 - val1;
        break;
      case 'NOT G2':
        result = 255 - val2;
        break;
      case 'Addition': 
        result = Math.min(val1 + val2, 255); 
        break;
      case 'Subtraction': 
        result = Math.max(val1 - val2, 0); 
        break;
      case 'Multiplication': 
        result = Math.min(val1 * val2 / 255, 255); 
        break;
      case 'Division': 
        result = val2 !== 0 ? Math.min((val1 / val2) * 255, 255) : 255; 
        break;
      default:
        result = 0;
    }
    resultData.data[i] = resultData.data[i + 1] = resultData.data[i + 2] = result;
    resultData.data[i + 3] = 255;
  }

  ctx.putImageData(resultData, 0, 0);
  return canvas.toDataURL();
};

const selectAllOperations = () => {
  selectedOperations.value = [...operations];
};

const deselectAllOperations = () => {
  selectedOperations.value = [];
};
</script>
