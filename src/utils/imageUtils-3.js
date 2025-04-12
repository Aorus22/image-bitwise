import { setupImageProcessing, createDataURL, toGrayscale } from '@/utils/imageUtils-1';

const gaussianBlur = (data, width, height, sigma = 1.0, kernelSize = 3) => {
  const kSize = kernelSize % 2 === 0 ? kernelSize + 1 : kernelSize;
  const kCenter = Math.floor(kSize / 2);
  const kernel = new Array(kSize).fill(0).map(() => new Array(kSize).fill(0));
  let sum = 0;

  for (let y = 0; y < kSize; y++) {
    for (let x = 0; x < kSize; x++) {
      const dx = x - kCenter;
      const dy = y - kCenter;
      kernel[y][x] = (1 / (2 * Math.PI * sigma * sigma)) * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      sum += kernel[y][x];
    }
  }
  for (let y = 0; y < kSize; y++) {
    for (let x = 0; x < kSize; x++) {
      kernel[y][x] /= sum;
    }
  }

  const output = new Uint8ClampedArray(data.length);
  const getGray = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    return data[(y * width + x) * 4];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = x + kx - kCenter;
          const py = y + ky - kCenter;
          sum += getGray(px, py) * kernel[ky][kx];
        }
      }
      const idx = (y * width + x) * 4;
      output[idx] = output[idx + 1] = output[idx + 2] = Math.min(Math.max(Math.round(sum), 0), 255);
      output[idx + 3] = 255;
    }
  }
  return output;
};

const convolve = (data, width, height, kernel) => {
  const kSize = kernel.length;
  const kCenter = Math.floor(kSize / 2);
  const output = new Float64Array(width * height);

  const getGray = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    return data[(y * width + x) * 4];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = x + kx - kCenter;
          const py = y + ky - kCenter;
          sum += getGray(px, py) * kernel[ky][kx];
        }
      }
      output[y * width + x] = sum;
    }
  }
  return output;
};

const normalize = (data, width, height) => {
  let max = 0;
  for (let i = 0; i < data.length; i++) {
    const absVal = Math.abs(data[i]);
    if (absVal > max) max = absVal;
  }
  max = max || 1;

  const output = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i++) {
    const value = (Math.abs(data[i]) / max) * 255;
    const idx = i * 4;
    output[idx] = output[idx + 1] = output[idx + 2] = Math.min(Math.max(Math.round(value), 0), 255);
    output[idx + 3] = 255;
  }
  return output;
};

const applyEdgeDetection = async (imageSrc, kernelX, kernelY) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const grayscale = await toGrayscale(imageSrc);
  let { imageData: grayData } = await setupImageProcessing(grayscale);

  // Apply Gaussian blur
  grayData.data.set(gaussianBlur(grayData.data, grayData.width, grayData.height, 0.5, 3));

  // Convolve
  const gradX = convolve(grayData.data, grayData.width, grayData.height, kernelX);
  const gradY = convolve(grayData.data, grayData.width, grayData.height, kernelY);

  // Compute magnitude
  const magnitude = new Float64Array(gradX.length);
  for (let i = 0; i < gradX.length; i++) {
    magnitude[i] = Math.sqrt(gradX[i] * gradX[i] + gradY[i] * gradY[i]);
  }

  // Normalize
  const result = normalize(magnitude, grayData.width, grayData.height);
  for (let i = 0; i < result.length; i++) {
    imageData.data[i] = result[i];
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applySobel = async (imageSrc) => {
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];
  return applyEdgeDetection(imageSrc, sobelX, sobelY);
};

export const applyPrewitt = async (imageSrc) => {
  const prewittX = [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ];
  const prewittY = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];
  return applyEdgeDetection(imageSrc, prewittX, prewittY);
};

export const applyRoberts = async (imageSrc) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const grayscale = await toGrayscale(imageSrc);
  const { imageData: grayData } = await setupImageProcessing(grayscale);

  const width = grayData.width;
  const height = grayData.height;
  const data = grayData.data;
  const output = new Float64Array(width * height);

  const gxKernel = [
    [1, 0],
    [0, -1],
  ];
  const gyKernel = [
    [0, 1],
    [-1, 0],
  ];

  const getGray = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    return data[(y * width + x) * 4];
  };

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      let gx = 0,
        gy = 0;
      for (let ky = 0; ky < 2; ky++) {
        for (let kx = 0; kx < 2; kx++) {
          const px = x + kx;
          const py = y + ky;
          const pixel = getGray(px, py);
          gx += pixel * gxKernel[ky][kx];
          gy += pixel * gyKernel[ky][kx];
        }
      }
      output[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  let max = 0;
  for (let i = 0; i < output.length; i++) {
    if (output[i] > max) max = output[i];
  }
  max = max || 1;

  const result = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < output.length; i++) {
    const normalized = (output[i] / max) * 255;
    const value = normalized > 30 ? 255 : 0;
    const idx = i * 4;
    result[idx] = result[idx + 1] = result[idx + 2] = value;
    result[idx + 3] = 255;
  }

  for (let i = 0; i < result.length; i++) {
    imageData.data[i] = result[i];
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyLoG = async (imageSrc, sigma = 1.0) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const grayscale = await toGrayscale(imageSrc);
  let { imageData: grayData } = await setupImageProcessing(grayscale);

  // Apply Gaussian blur
  grayData.data.set(gaussianBlur(grayData.data, grayData.width, grayData.height, sigma, 5));

  const kernel = [
    [0, 0, -1, 0, 0],
    [0, -1, -2, -1, 0],
    [-1, -2, 16, -2, -1],
    [0, -1, -2, -1, 0],
    [0, 0, -1, 0, 0],
  ];

  const width = grayData.width;
  const height = grayData.height;
  const output = convolve(grayData.data, width, height, kernel);

  const result = normalize(output, width, height);
  for (let i = 0; i < result.length; i++) {
    imageData.data[i] = result[i];
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyKompas = async (imageSrc, direction = "North") => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const grayscale = await toGrayscale(imageSrc);
  let { imageData: grayData } = await setupImageProcessing(grayscale);

  grayData.data.set(gaussianBlur(grayData.data, grayData.width, grayData.height, 0.833, 5));

  const compassKernels = {
    North: [
      [1, 1, 1],
      [1, -2, 1],
      [-1, -1, -1],
    ],
    Northeast: [
      [1, 1, -1],
      [1, -2, 1],
      [-1, 1, 1],
    ],
    East: [
      [-1, 1, 1],
      [-1, -2, 1],
      [-1, 1, 1],
    ],
    Southeast: [
      [-1, 1, 1],
      [-1, -2, 1],
      [1, 1, -1],
    ],
    South: [
      [-1, -1, -1],
      [1, -2, 1],
      [1, 1, 1],
    ],
    Southwest: [
      [1, 1, -1],
      [1, -2, 1],
      [1, -1, 1],
    ],
    West: [
      [1, 1, -1],
      [1, -2, -1],
      [1, 1, -1],
    ],
    Northwest: [
      [1, -1, -1],
      [1, -2, 1],
      [1, 1, 1],
    ],
  };

  const width = grayData.width;
  const height = grayData.height;
  let output;

  if (direction === "All Directions") {
    const responses = Object.values(compassKernels).map((kernel) => convolve(grayData.data, width, height, kernel));
    output = new Float64Array(width * height);
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.max(...responses.map((r) => Math.abs(r[i])));
    }
  } else {
    output = convolve(grayData.data, width, height, compassKernels[direction]);
    output = output.map(Math.abs);
  }

  const result = normalize(output, width, height);
  for (let i = 0; i < result.length; i++) {
    imageData.data[i] = result[i];
  }

  return createDataURL(canvas, imageData, ctx);
};