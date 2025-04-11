import { setupImageProcessing, createDataURL } from '@/utils/imageUtils-1';

export const applyNegativeTransformation = async (imgSrc) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imgSrc);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];         // Red 
    data[i + 1] = 255 - data[i + 1]; // Green
    data[i + 2] = 255 - data[i + 2]; // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};

export const calculateHistogram = (imageData) => {
  const histogramR = new Array(256).fill(0);
  const histogramG = new Array(256).fill(0);
  const histogramB = new Array(256).fill(0);

  for (let i = 0; i < imageData.data.length; i += 4) {
    histogramR[imageData.data[i]]++;
    histogramG[imageData.data[i + 1]]++;
    histogramB[imageData.data[i + 2]]++;
  }

  return { histogramR, histogramG, histogramB };
};

export const applyHistogramEqualization = async (imageSrc) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
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

  return createDataURL(canvas, imageData, ctx);
};

export const applyLocalHistogramEqualization = async (imageSrc, windowSize) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Convert image to grayscale
  const grayscale = new Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    grayscale[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Apply local histogram equalization
  const halfWindow = Math.floor(windowSize / 2);
  const output = new Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let histogram = new Array(256).fill(0);
      let minValue = 255, maxValue = 0;

      // Extract local window
      for (let j = -halfWindow; j <= halfWindow; j++) {
        for (let i = -halfWindow; i <= halfWindow; i++) {
          let nx = x + i;
          let ny = y + j;
          if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
            let pixelValue = grayscale[ny * width + nx];
            histogram[Math.floor(pixelValue)]++;
            if (pixelValue < minValue) minValue = pixelValue;
            if (pixelValue > maxValue) maxValue = pixelValue;
          }
        }
      }

      // Compute cumulative histogram (CDF)
      let cdf = new Array(256).fill(0);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }

      let totalPixels = cdf[255];
      let scaleFactor = 255 / totalPixels;

      // Apply histogram equalization
      let pixelValue = grayscale[y * width + x];
      let newValue = Math.floor(scaleFactor * cdf[Math.floor(pixelValue)]);
      output[y * width + x] = newValue;
    }
  }

  // Update the image with the processed values
  for (let i = 0; i < data.length; i += 4) {
    data[i] = output[i / 4];     // Red
    data[i + 1] = output[i / 4]; // Green
    data[i + 2] = output[i / 4]; // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyGammaTransformation = async (imageSrc, gamma) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 * Math.pow(data[i] / 255, gamma);         // Red
    data[i + 1] = 255 * Math.pow(data[i + 1] / 255, gamma); // Green
    data[i + 2] = 255 * Math.pow(data[i + 2] / 255, gamma); // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyBitPlaneSlicing = async (imageSrc, bitPlane) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Get the grayscale value from the red channel
    const gray = data[i];
    // Extract the specific bit at a given position
    const bitValue = (gray >> bitPlane) & 1;
    const newPixelValue = bitValue * 255;

    data[i] = newPixelValue;     // Red
    data[i + 1] = newPixelValue; // Green
    data[i + 2] = newPixelValue; // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyLogTransformation = async (imageSrc, scale) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const data = imageData.data;

  const c = 255 / Math.log(1 + scale);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = c * Math.log(1 + data[i]);          // Red
    data[i + 1] = c * Math.log(1 + data[i + 1]);  // Green
    data[i + 2] = c * Math.log(1 + data[i + 2]);  // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyHistogramStretching = async (imageSrc, rgbMin, rgbMax) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const data = imageData.data;

  const clamp = (value) => Math.min(255, Math.max(0, value));
  const stretch = (value, min, max) => ((value - min) * 255) / (max - min);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(stretch(data[i], rgbMin[0], rgbMax[0]));         // Red
    data[i + 1] = clamp(stretch(data[i + 1], rgbMin[1], rgbMax[1])); // Green
    data[i + 2] = clamp(stretch(data[i + 2], rgbMin[2], rgbMax[2])); // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyContrastStretching = async (imageSrc, contrastMin, contrastMax) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const data = imageData.data;

  const clamp = (value) => Math.min(255, Math.max(0, value));
  const stretch = (value) => ((value - contrastMin) * 255) / (contrastMax - contrastMin);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(stretch(data[i]));         // Red
    data[i + 1] = clamp(stretch(data[i + 1])); // Green
    data[i + 2] = clamp(stretch(data[i + 2])); // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyIntensityStretching = async (imageSrc, intensityMin, intensityMax) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const data = imageData.data;

  const clamp = (value) => Math.min(255, Math.max(0, value));
  const stretch = (value) => ((value - intensityMin) * 255) / (intensityMax - intensityMin);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(stretch(data[i]));       // Red
    data[i + 1] = clamp(stretch(data[i + 1])); // Green
    data[i + 2] = clamp(stretch(data[i + 2])); // Blue
  }

  return createDataURL(canvas, imageData, ctx);
};
