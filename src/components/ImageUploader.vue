<template>
  <Card class="max-w-3xl w-full duration-300">
    <CardHeader class="pb-4">
      <CardTitle class="text-2xl font-bold text-gray-800">{{ title }}</CardTitle>
      <CardDescription class="text-gray-600">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <div class="relative">
        <Label for="imageUpload" @click="triggerFileInput">
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
              <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 100MB)</p>
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
        <Input
          id="imageUpload"
          type="file"
          accept="image/*"
          class="hidden"
          ref="fileInput"
          @change="handleFileUpload"
        />
      </div>

      <div v-if="showGrayscaleButton" class="flex items-center space-x-2">
        <input
          type="checkbox"
          id="grayscaleCheckbox"
          v-model="localUseGrayscale"
          class="cursor-pointer h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <Label for="grayscaleCheckbox" class="text-gray-700">Convert to Grayscale First</Label>
      </div>

      <Button
        v-if="image && showButton"
        @click="$emit('process-image')"
        class="w-full bg-[#159763] hover:bg-green-700 text-white py-3 rounded-lg transition-all duration-300"
      >
        Show Histogram
      </Button>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadIcon } from 'lucide-vue-next';

const props = defineProps({
  image: {
    type: String,
    default: null,
  },
  useGrayscale: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Image Histogram Analyzer',
  },
  description: {
    type: String,
    default: 'Upload an image to generate its histogram',
  },
  showButton: {
    type: Boolean,
    default: true,
  },
  showGrayscaleButton: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:image', 'update:useGrayscale', 'process-image', 'reset-processed-image']);

const dragActive = ref(false);
const fileInput = ref(null);

const localImage = computed({
  get: () => props.image,
  set: (value) => emit('update:image', value),
});

const localUseGrayscale = computed({
  get: () => props.useGrayscale,
  set: (value) => emit('update:useGrayscale', value),
});

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
    fileInput.value.click();
  }
};

const handleDrop = (event) => {
  dragActive.value = false;
  const file = event.dataTransfer.files[0];
  if (file && fileInput.value) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.value.files = dataTransfer.files;
    handleFileUpload({ target: fileInput.value });
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  emit('reset-processed-image');

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
    event.target.value = '';
    return;
  }
  if (file.size > 100 * 1024 * 1024) {
    alert('File size exceeds 100MB. Please upload a smaller image.');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    localImage.value = e.target.result;
    event.target.value = '';
  };
  reader.onerror = () => {
    alert('Error reading file. Please try again.');
    event.target.value = '';
  };
  reader.readAsDataURL(file);
};

const handleRemoveImage = () => {
  localImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  emit('reset-processed-image');
};
</script>

<style scoped>
div[for="imageUpload"] {
  transition: all 0.3s ease-in-out;
}

button {
  transition: all 0.3s ease-in-out;
}
</style>