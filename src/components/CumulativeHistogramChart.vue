<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle class="text-center text-lg font-semibold text-gray-800">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <canvas ref="cumulativeHistogramCanvas" class="w-full h-64"></canvas>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { drawCumulativeHistogram } from '@/utils/imageUtils';

const props = defineProps({
  imageData: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Cumulative Histogram'
  }
});

const cumulativeHistogramCanvas = ref(null);
let cumulativeHistogramChartInstance = null;

const renderHistogram = async () => {
  if (cumulativeHistogramCanvas.value && props.imageData) {
    if (cumulativeHistogramChartInstance) {
      cumulativeHistogramChartInstance.destroy();
    }
    
    cumulativeHistogramChartInstance = await drawCumulativeHistogram(
      props.imageData,
      cumulativeHistogramCanvas.value,
      null
    );
  }
};

onMounted(renderHistogram);

watch(() => props.imageData, renderHistogram);
</script>