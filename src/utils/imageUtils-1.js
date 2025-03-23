export const setupImageProcessing = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve({ canvas, ctx, imageData, img });
    };

    img.onerror = () => reject(new Error('Error loading image'));
  });
};

export const createDataURL = (canvas, imageData, ctx) => {
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

export const toGrayscale = async (image) => {
  if (!image) {
    throw new Error('No image provided');
  }

  const { canvas, ctx, imageData } = await setupImageProcessing(image);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }

  return createDataURL(canvas, imageData, ctx);
};

export const applyBitwiseOperation = async (img1, img2, operation) => {
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

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
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