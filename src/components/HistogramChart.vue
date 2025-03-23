<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle class="text-center text-lg font-semibold text-gray-800">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent class="relative">
      <div class="absolute bottom-4 left-4">
        <Button variant="outline" class="border-none text-xs bg-green-100 text-green-700" size="xs" @click="resetZoom">Reset Zoom</Button>
      </div>
      <canvas ref="histogramCanvas" class="w-full h-64"></canvas>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { setupImageProcessing } from '@/utils/imageUtils-1';
import { calculateHistogram } from '@/utils/imageUtils-2';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
Chart.register(zoomPlugin);

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
    type: 'line',
    data: {
      labels: Array.from({ length: 256 }, (_, i) => i),
      datasets: [
        {
          label: 'Red',
          data: histogramR,
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          borderColor: 'rgba(255, 0, 0, 1)',
          borderWidth: 0.5,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
        },
        {
          label: 'Green',
          data: histogramG,
          backgroundColor: 'rgba(0, 255, 0, 0.5)',
          borderColor: 'rgba(0, 255, 0, 1)',
          borderWidth: 0.5,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
        },
        {
          label: 'Blue',
          data: histogramB,
          backgroundColor: 'rgba(0, 0, 255, 0.5)',
          borderColor: 'rgba(0, 0, 255, 1)',
          borderWidth: 0.5,
          fill: true,
          tension: 0.1,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          title: { display: true, text: 'Intensity' },
          min: 0,
          max: 255
        },
        y: { 
          title: { display: true, text: 'Frequency' },
          beginAtZero: true,
          min: 0
        },
      },
      plugins: {
        legend: { display: true },
        zoom: {
          limits: {
            y: { min: 0, max: 'original' },
            x: { min: 0, max: 255 }
          },
          zoom: {
            wheel: {
              enabled: true,
              speed: 0.1
            },
            pinch: {
              enabled: true
            },
            mode: 'xy',
            rangeMin: {
              y: 0
            }
          },
          pan: {
            enabled: true,
            mode: 'xy',
            speed: 10,
            threshold: 10,
            rangeMin: {
              y: 0
            }
          }
        }
      }
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
      null
    );
  }
};

const resetZoom = () => {
  if (histogramChartInstance) {
    histogramChartInstance.resetZoom();
  }
};

onMounted(renderHistogram);

watch(() => props.imageData, renderHistogram);
</script>