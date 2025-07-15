export type RGBArray = [number, number, number];

function isColorDescription(elem: unknown): boolean {
  if (
    typeof elem === "string" &&
    (elem.startsWith("#") ||
      elem.startsWith("rgb(") ||
      elem.startsWith("rgba(") ||
      elem.startsWith("hsl(") ||
      elem.startsWith("hwb("))
  ) {
    return true;
  }

  return false;
}

export function findColor(data: unknown, modifier: (color: string) => string) {
  // We deal with strings but only from their parent perspective
  // so that we can change the value from the ref
  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean" ||
    data === null ||
    data === undefined
  ) {
    return;
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const elem = data[i];

      if (isColorDescription(elem)) {
        data[i] = modifier(elem);
        continue;
      }
      findColor(elem, modifier);
    }
  } else if (typeof data === "object") {
    const dataAsRecord = data as Record<string, unknown>;
    const keys = Object.keys(data);

    for (const k of keys) {
      const elem = dataAsRecord[k];

      if (isColorDescription(elem)) {
        dataAsRecord[k] = modifier(elem as string);
        continue;
      }

      findColor(elem, modifier);
    }
  }
}

export function applyBrightnessSingle(input: number, brightness: number): number {
  const normalized = input / 255;
  const adjusted = normalized + (1 - normalized) * normalized * brightness;
  return Math.max(0, Math.min(255, adjusted * 255));
}

export function applyBrightnessRGB(input: RGBArray, brightness: number): RGBArray {
  return input.map((chan) => applyBrightnessSingle(chan, brightness)) as RGBArray;
}

export function applyContrastSingle_OLD(input: number, contrast: number, midpoint = 127): number {
  const centered = input - midpoint;
  const factor =
    contrast >= 0
      ? 1 + contrast
      : // Map [0, 1] to [1, 3]
        1 + contrast; // Map [-1, 0] to [0, 1]

  let adjusted: number;

  if (contrast >= 0) {
    // Increasing contrast: apply more effect to values further from midpoint
    // Use a curve that avoids harsh clipping
    const normalizedDistance = Math.abs(centered) / midpoint;
    const scaleFactor = factor * (1 + normalizedDistance * contrast * 0.5);
    adjusted = midpoint + centered * scaleFactor;
  } else {
    // Decreasing contrast: move values toward midpoint
    // Use a curve that maintains some variation even at extreme settings
    adjusted = midpoint + centered * factor;
  }

  // Clamp to valid range
  return Math.round(Math.max(0, Math.min(255, adjusted)));
}



export function applyContrastSingle(input: number, contrast: number, midpoint = 127): number {
  const boundedContrast = Math.max(-0.99, Math.min(0.99, contrast));
  const steepness = boundedContrast < 0 ? boundedContrast + 1 : 1 / ( 1 - boundedContrast);
  const adjusted = midpoint + steepness * (input - midpoint)

  // Clamp to valid range
  return Math.round(Math.max(0, Math.min(255, adjusted)));
}



export function applyContrastRGB(input: RGBArray, contrast: number, midpoint = 127): RGBArray {
  return input.map((chan) => applyContrastSingle(chan, contrast, midpoint)) as RGBArray;
}

export function applyMultiplicationSingle(input1: number, input2: number, ratio = 1): number {
  return 255 * (input1 / 255) * (input2 / 255) * ratio + (input1 / 255) * (1 - ratio) * 255;
}

export function applyMultiplicationRGB(input1: RGBArray, input2: RGBArray, ratio = 1): RGBArray {
  return input1.map((_chan, i) => applyMultiplicationSingle(input1[i], input2[i], ratio)) as RGBArray;
}
