import { setupImageProcessing, createDataURL, toGrayscale } from '@/utils/imageUtils-1';

const convolve = (imageData, width, height, kernelX, kernelY) => {
  const output = new Uint8ClampedArray(imageData.length);
  const data = imageData;
  const getPixel = (x, y, c) => data[(y * width + x) * 4 + c];

  for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
          let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const gray = getPixel(px, py, 0);
          gx += gray * kernelX[ky + 1][kx + 1];
          gy += gray * kernelY[ky + 1][kx + 1];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const idx = (y * width + x) * 4;
      output[idx] = output[idx + 1] = output[idx + 2] = magnitude;
      output[idx + 3] = 255;
    }
  }

  return output;
};

export const applyEdgeDetection = async (imageSrc, kernelX, kernelY) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const grayscale = await toGrayscale(imageSrc);
  const { imageData: grayData } = await setupImageProcessing(grayscale);

  const newData = convolve(grayData.data, grayData.width, grayData.height, kernelX, kernelY);
  for (let i = 0; i < newData.length; i++) {
    imageData.data[i] = newData[i];
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applySobel = (imageSrc) => {
  const sobelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  const sobelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
  ];
  return applyEdgeDetection(imageSrc, sobelX, sobelY);
};

export const applyPrewitt = (imageSrc) => {
  const prewittX = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1]
  ];
  const prewittY = [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1]
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
  const output = new Uint8ClampedArray(data.length);

  const getGray = (x, y) => data[(y * width + x) * 4];

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const gx = getGray(x, y) - getGray(x + 1, y + 1);
      const gy = getGray(x + 1, y) - getGray(x, y + 1);
      const idx = (y * width + x) * 4;
      const g = Math.sqrt(gx * gx + gy * gy);
      output[idx] = output[idx + 1] = output[idx + 2] = g;
      output[idx + 3] = 255;
    }
  }

  for (let i = 0; i < output.length; i++) {
    imageData.data[i] = output[i];
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyLoG = async (imageSrc) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imageSrc);
  const grayscale = await toGrayscale(imageSrc);
  const { imageData: grayData } = await setupImageProcessing(grayscale);

  const kernel = [
    [0, 0, -1, 0, 0],
    [0, -1, -2, -1, 0],
    [-1, -2, 16, -2, -1],
    [0, -1, -2, -1, 0],
    [0, 0, -1, 0, 0]
  ];

  const applyKernel = (data, width, height, kernel) => {
    const kSize = kernel.length;
    const kCenter = Math.floor(kSize / 2);
    const output = new Uint8ClampedArray(data.length);

    const getGray = (x, y) => data[(y * width + x) * 4];

    for (let y = kCenter; y < height - kCenter; y++) {
      for (let x = kCenter; x < width - kCenter; x++) {
        let sum = 0;
        for (let ky = 0; ky < kSize; ky++) {
          for (let kx = 0; kx < kSize; kx++) {
            const px = x + kx - kCenter;
            const py = y + ky - kCenter;
            sum += getGray(px, py) * kernel[ky][kx];
          }
        }
        const idx = (y * width + x) * 4;
        output[idx] = output[idx + 1] = output[idx + 2] = Math.min(Math.max(sum, 0), 255);
        output[idx + 3] = 255;
      }
    }

    return output;
  };

  const result = applyKernel(grayData.data, grayData.width, grayData.height, kernel);
  for (let i = 0; i < result.length; i++) {
    imageData.data[i] = result[i];
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyKompas = async (imgSrc) => {
  const { canvas, ctx, imageData } = await setupImageProcessing(imgSrc);
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new Uint8ClampedArray(data.length);

  const kernel = [
    [-1, -1, -1],
    [ 1, -2,  1],
    [ 1,  1,  1]
  ];

  const getGray = (x, y) => {
    const idx = (y * width + x) * 4;
    return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
  };

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixel = getGray(x + kx, y + ky);
          sum += pixel * kernel[ky + 1][kx + 1];
        }
      }

      const idx = (y * width + x) * 4;
      const edge = Math.min(255, Math.max(0, Math.abs(sum)));

      output[idx] = output[idx + 1] = output[idx + 2] = edge;
      output[idx + 3] = 255;
    }
  }

  const newImageData = new ImageData(output, width, height);
  return createDataURL(canvas, newImageData, ctx);
};
