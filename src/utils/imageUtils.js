import Chart from 'chart.js/auto';

export const toGrayscale = (image) => {
  return new Promise((resolve, reject) => {
    if (!image) {
      reject(new Error('No image provided'));
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

    img.onerror = () => reject(new Error('Error loading image'));
  });
};

export const applyBitwiseOperation = async (img1, img2, operation) => {
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
    switch (operation) {
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
      case 'G1 NOT G2':
        result = val1 & (255 - val2);
        break;
      case 'G2 NOT G1':
        result = val2 & (255 - val1);
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

export const applyHistogramEqualization = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      const histogram = new Array(256).fill(0);
      for (let i = 0; i < data.length; i += 4) {
        histogram[data[i]]++;
      }

      const cdf = new Array(256).fill(0);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }

      const cdfMin = cdf.find(val => val > 0);
      const cdfMax = cdf[255];
      const equalizedValues = new Array(256).fill(0);
      for (let i = 0; i < 256; i++) {
        equalizedValues[i] = Math.round(((cdf[i] - cdfMin) / (cdfMax - cdfMin)) * 255);
      }

      for (let i = 0; i < data.length; i += 4) {
        const intensity = data[i];
        const equalizedIntensity = equalizedValues[intensity];
        data[i] = equalizedIntensity;
        data[i + 1] = equalizedIntensity;
        data[i + 2] = equalizedIntensity;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => reject(new Error('Error loading image for equalization'));
  });
};

export const drawHistogram = (imageSrc, canvasElement, chartInstance, chartLabel, bgColor, borderColor) => {
  return new Promise((resolve, reject) => {
    if (!imageSrc || !canvasElement) {
      console.error('Image or histogram canvas not available');
      reject(new Error('Image or histogram canvas not available'));
      return;
    }

    const ctx = canvasElement.getContext('2d');
    const histogram = new Array(256).fill(0);
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      tmpCanvas.width = img.width;
      tmpCanvas.height = img.height;
      tmpCtx.drawImage(img, 0, 0);
      const imageData = tmpCtx.getImageData(0, 0, img.width, img.height);

      for (let i = 0; i < imageData.data.length; i += 4) {
        histogram[imageData.data[i]]++;
      }

      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 256 }, (_, i) => i),
          datasets: [
            {
              label: chartLabel,
              data: histogram,
              backgroundColor: bgColor,
              borderColor: borderColor,
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
            legend: { display: false },
          },
        },
      });

      resolve(chartInstance);
    };

    img.onerror = () => {
      console.error('Error loading image for histogram');
      reject(new Error('Error loading image for histogram'));
    };
  });
};

export const drawCumulativeHistogram = (imageSrc, canvasElement, chartInstance) => {
  return new Promise((resolve, reject) => {
    if (!imageSrc || !canvasElement) {
      console.error('Image or cumulative histogram canvas not available');
      reject(new Error('Image or cumulative histogram canvas not available'));
      return;
    }

    const ctx = canvasElement.getContext('2d');
    const histogram = new Array(256).fill(0);
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      tmpCanvas.width = img.width;
      tmpCanvas.height = img.height;
      tmpCtx.drawImage(img, 0, 0);
      const imageData = tmpCtx.getImageData(0, 0, img.width, img.height);

      for (let i = 0; i < imageData.data.length; i += 4) {
        histogram[imageData.data[i]]++;
      }

      const cumulativeHistogram = new Array(256).fill(0);
      cumulativeHistogram[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cumulativeHistogram[i] = cumulativeHistogram[i - 1] + histogram[i];
      }

      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 256 }, (_, i) => i),
          datasets: [
            {
              label: 'Cumulative Frequency',
              data: cumulativeHistogram,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Intensity' } },
            y: { title: { display: true, text: 'Cumulative Frequency' }, beginAtZero: true },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });

      resolve(chartInstance);
    };

    img.onerror = () => {
      console.error('Error loading image for cumulative histogram');
      reject(new Error('Error loading image for cumulative histogram'));
    };
  });
};