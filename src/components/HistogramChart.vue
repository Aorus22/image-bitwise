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
import { setupImageProcessing } from '@/utils/imageUtils-1';
import { calculateHistogram } from '@/utils/imageUtils-2';
import Chart from 'chart.js/auto';

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

const drawHistogram = async (imageSrc, canvasElement, chartInstance) => {
  if (!imageSrc || !canvasElement) {
    throw new Error('Image or histogram canvas not available');
  }

  const { imageData } = await setupImageProcessing(imageSrc);
  const { histogramR, histogramG, histogramB } = calculateHistogram(imageData);

  if (chartInstance) chartInstance.destroy();

  const ctx = canvasElement.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 256 }, (_, i) => i),
      datasets: [
        {
          label: 'Red',
          data: histogramR,
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          borderColor: 'rgba(255, 0, 0, 1)',
          borderWidth: 1,
        },
        {
          label: 'Green',
          data: histogramG,
          backgroundColor: 'rgba(0, 255, 0, 0.5)',
          borderColor: 'rgba(0, 255, 0, 1)',
          borderWidth: 1,
        },
        {
          label: 'Blue',
          data: histogramB,
          backgroundColor: 'rgba(0, 0, 255, 0.5)',
          borderColor: 'rgba(0, 0, 255, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Intensity' } },
        y: { title: { display: true, text: 'Frequency' }, beginAtZero: true },
      },
      plugins: {
        legend: { display: true },
      },
    },
  });

  return chartInstance;
};

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