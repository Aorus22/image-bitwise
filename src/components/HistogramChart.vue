<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle class="text-center text-lg font-semibold text-gray-800">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <canvas ref="histogramCanvas" class="w-full h-64"></canvas>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { drawHistogram } from '@/utils/imageUtils';

const props = defineProps({
  imageData: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Histogram'
  },
  colorBackground: {
    type: String,
    default: 'rgba(75, 192, 192, 0.6)'
  },
  colorBorder: {
    type: String,
    default: 'rgba(75, 192, 192, 1)'
  }
});

const histogramCanvas = ref(null);
let histogramChartInstance = null;

const renderHistogram = async () => {
  if (histogramCanvas.value && props.imageData) {
    if (histogramChartInstance) {
      histogramChartInstance.destroy();
    }
    
    histogramChartInstance = await drawHistogram(
      props.imageData,
      histogramCanvas.value,
      null,
      'Pixel Intensity',
      props.colorBackground,
      props.colorBorder
    );
  }
};

onMounted(renderHistogram);

watch(() => props.imageData, renderHistogram);
</script>