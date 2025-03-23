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
    const r1 = data1.data[i];     // Red channel img1
    const g1 = data1.data[i + 1]; // Green channel img1
    const b1 = data1.data[i + 2]; // Blue channel img1
    const r2 = data2.data[i];     // Red channel img2
    const g2 = data2.data[i + 1]; // Green channel img2
    const b2 = data2.data[i + 2]; // Blue channel img2

    let r, g, b;

    // Apply bitwise operation for each channel
    switch (operation) {
      case 'AND':
        r = r1 & r2;
        g = g1 & g2;
        b = b1 & b2;
        break;
      case 'OR':
        r = r1 | r2;
        g = g1 | g2;
        b = b1 | b2;
        break;
      case 'XOR':
        r = r1 ^ r2;
        g = g1 ^ g2;
        b = b1 ^ b2;
        break;
      case 'XNOR':
        r = 255 - (r1 ^ r2);
        g = 255 - (g1 ^ g2);
        b = 255 - (b1 ^ b2);
        break;
      case 'NAND':
        r = 255 - (r1 & r2);
        g = 255 - (g1 & g2);
        b = 255 - (b1 & b2);
        break;
      case 'NOR':
        r = 255 - (r1 | r2);
        g = 255 - (g1 | g2);
        b = 255 - (b1 | b2);
        break;
      case 'NOT G1':
        r = 255 - r1;
        g = 255 - g1;
        b = 255 - b1;
        break;
      case 'NOT G2':
        r = 255 - r2;
        g = 255 - g2;
        b = 255 - b2;
        break;
      case 'G1 NOT G2':
        r = r1 & (255 - r2);
        g = g1 & (255 - g2);
        b = b1 & (255 - b2);
        break;
      case 'G2 NOT G1':
        r = r2 & (255 - r1);
        g = g2 & (255 - g1);
        b = b2 & (255 - b1);
        break;
      case 'Addition':
        r = Math.min(r1 + r2, 255);
        g = Math.min(g1 + g2, 255);
        b = Math.min(b1 + b2, 255);
        break;
      case 'Subtraction':
        r = Math.max(r1 - r2, 0);
        g = Math.max(g1 - g2, 0);
        b = Math.max(b1 - b2, 0);
        break;
      case 'Multiplication':
        r = Math.min((r1 * r2) / 255, 255);
        g = Math.min((g1 * g2) / 255, 255);
        b = Math.min((b1 * b2) / 255, 255);
        break;
      case 'Division':
        r = r2 !== 0 ? Math.min((r1 / r2) * 255, 255) : 255;
        g = g2 !== 0 ? Math.min((g1 / g2) * 255, 255) : 255;
        b = b2 !== 0 ? Math.min((b1 / b2) * 255, 255) : 255;
        break;
      default:
        r = g = b = 0;
    }

    resultData.data[i] = r;       // Red channel
    resultData.data[i + 1] = g;   // Green channel
    resultData.data[i + 2] = b;   // Blue channel
    resultData.data[i + 3] = 255; // Alpha channel
  }

  ctx.putImageData(resultData, 0, 0);
  return canvas.toDataURL();
};

export const invertImage = async (imageSrc) => {
  const invertedImage = await applyBitwiseOperation(imageSrc, imageSrc, 'NOT G1');
  return invertedImage;
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
        const rIntensity = data[i];        // Red
        const gIntensity = data[i + 1];    // Green
        const bIntensity = data[i + 2];    // Blue
      
        const equalizedR = equalizedValues[rIntensity];
        const equalizedG = equalizedValues[gIntensity];
        const equalizedB = equalizedValues[bIntensity];
      
        data[i] = equalizedR;
        data[i + 1] = equalizedG;
        data[i + 2] = equalizedB;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => reject(new Error('Error loading image for equalization'));
  });
};

export const drawHistogram = (imageSrc, canvasElement, chartInstance) => {
  return new Promise((resolve, reject) => {
    if (!imageSrc || !canvasElement) {
      reject(new Error('Image or histogram canvas not available'));
      return;
    }

    const ctx = canvasElement.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      tmpCanvas.width = img.width;
      tmpCanvas.height = img.height;
      tmpCtx.drawImage(img, 0, 0);
      const imageData = tmpCtx.getImageData(0, 0, img.width, img.height);

      // Initialize histogram for each channel
      const histogramR = new Array(256).fill(0);
      const histogramG = new Array(256).fill(0);
      const histogramB = new Array(256).fill(0);

      // Calculate frequency of each channel
      for (let i = 0; i < imageData.data.length; i += 4) {
        histogramR[imageData.data[i]]++;
        histogramG[imageData.data[i + 1]]++;
        histogramB[imageData.data[i + 2]]++;
      }

      if (chartInstance) chartInstance.destroy();

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

      resolve(chartInstance);
    };

    img.onerror = () => reject(new Error('Error loading image for histogram'));
  });
};

export const drawCumulativeHistogram = (imageSrc, canvasElement, chartInstance) => {
  return new Promise((resolve, reject) => {
    if (!imageSrc || !canvasElement) {
      reject(new Error('Image or cumulative histogram canvas not available'));
      return;
    }

    const ctx = canvasElement.getContext('2d');
    const tmpCanvas = document.createElement('canvas');
    const tmpCtx = tmpCanvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      tmpCanvas.width = img.width;
      tmpCanvas.height = img.height;
      tmpCtx.drawImage(img, 0, 0);
      const imageData = tmpCtx.getImageData(0, 0, img.width, img.height);

      // Initialize histogram for each channel
      const histogramR = new Array(256).fill(0);
      const histogramG = new Array(256).fill(0);
      const histogramB = new Array(256).fill(0);

      // Calculate frequency of each channel
      for (let i = 0; i < imageData.data.length; i += 4) {
        histogramR[imageData.data[i]]++;
        histogramG[imageData.data[i + 1]]++;
        histogramB[imageData.data[i + 2]]++;
      }

      // Calculate cumulative histogram for each channel
      const cumulativeR = histogramR.map((_, i, arr) => arr.slice(0, i + 1).reduce((a, b) => a + b));
      const cumulativeG = histogramG.map((_, i, arr) => arr.slice(0, i + 1).reduce((a, b) => a + b));
      const cumulativeB = histogramB.map((_, i, arr) => arr.slice(0, i + 1).reduce((a, b) => a + b));

      if (chartInstance) chartInstance.destroy();

      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 256 }, (_, i) => i),
          datasets: [
            {
              label: 'Cumulative Red',
              data: cumulativeR,
              borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              fill: true,
              tension: 0.1,
            },
            {
              label: 'Cumulative Green',
              data: cumulativeG,
              borderColor: 'rgba(0, 255, 0, 1)',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              fill: true,
              tension: 0.1,
            },
            {
              label: 'Cumulative Blue',
              data: cumulativeB,
              borderColor: 'rgba(0, 0, 255, 1)',
              backgroundColor: 'rgba(0, 0, 255, 0.2)',
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
            legend: { display: true },
          },
        },
      });

      resolve(chartInstance);
    };

    img.onerror = () => reject(new Error('Error loading image for cumulative histogram'));
  });
};

export const applyGammaTransformation = (imageSrc, gamma) => {
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

      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 * Math.pow(data[i] / 255, gamma);         // Red
        data[i + 1] = 255 * Math.pow(data[i + 1] / 255, gamma); // Green
        data[i + 2] = 255 * Math.pow(data[i + 2] / 255, gamma); // Blue
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => reject(new Error('Error loading image for gamma transformation'));
  });
};

export const applyBitPlaneSlicing = (imageSrc, bitPlane) => {
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

      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i];                     // Get the grayscale value from the red channel
        const bitValue = (gray >> bitPlane) & 1;  // Extract the specific bit at a given position
        const newPixelValue = bitValue * 255;     // Black (0) atau White (255)
        
        data[i] = newPixelValue;     // R
        data[i + 1] = newPixelValue; // G
        data[i + 2] = newPixelValue; // B
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL());
    };

    img.onerror = () => reject(new Error('Error loading image for bit-plane slicing'));
  });
};
