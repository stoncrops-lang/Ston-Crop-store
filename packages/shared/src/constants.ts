import { GarmentSize, SizeMeasurement } from '@stoncrops/types';

export const BRAND_NAME = 'STONCROPS';
export const BRAND_TAGLINE = 'EMBROIDERED EDITION';

export const PRODUCT_NAME = 'STONCROPS — Embroidered Edition';
export const PRODUCT_SLUG = 'embroidered-edition';
export const PRODUCT_PRICE = 1199; // ₹1,199
export const PRODUCT_CURRENCY = 'INR';
export const FREE_SHIPPING_TEXT = 'FREE SHIPPING ACROSS INDIA';

export const INSTAGRAM_URL = 'https://www.instagram.com/stonecrops.in?hvrq=MWh2MDUyeWo4cTVyMw==';
export const INSTAGRAM_HANDLE = '@stonecrops.in';

export const OFFICIAL_MEASUREMENTS: Record<GarmentSize, SizeMeasurement> = {
  S: {
    size: 'S',
    chestInches: 21.5,
    chestCm: 55,
    lengthInches: 27.5,
    lengthCm: 70,
    shoulderInches: 21.5,
    shoulderCm: 55,
    sleeveInches: 23.0,
    sleeveCm: 58.5,
  },
  M: {
    size: 'M',
    chestInches: 23.0,
    chestCm: 58.5,
    lengthInches: 28.0,
    lengthCm: 71,
    shoulderInches: 22.0,
    shoulderCm: 56,
    sleeveInches: 24.0,
    sleeveCm: 61,
  },
  L: {
    size: 'L',
    chestInches: 24.0,
    chestCm: 61,
    lengthInches: 29.0,
    lengthCm: 73.5,
    shoulderInches: 22.5,
    shoulderCm: 57,
    sleeveInches: 24.5,
    sleeveCm: 62,
  },
};

export const FIT_PROFILE =
  'Relaxed, boxy drop-shoulder oversized fit. Choose your regular size for the intended oversized drape, or size down for a closer fit.';

export const MEASUREMENT_TOLERANCE =
  'All measurements are taken flat-laid. Please allow a minor variance of ±0.5 inches due to manual measuring and fabric finishing.';

export const WASH_CARE_INSTRUCTIONS = [
  'Detach the metal chain accessory before washing.',
  'Machine wash cold inside-out on a gentle cycle to preserve the custom embroidery work.',
  'Do not bleach or tumble dry.',
  'Warm iron on reverse side if needed; avoid direct iron on embroidery.',
];

export const HOW_TO_MEASURE_GUIDE = [
  {
    part: 'Chest (Width)',
    instruction:
      'Lay your favorite T-shirt flat and measure straight across from armpit seam to armpit seam.',
  },
  {
    part: 'Length (Height)',
    instruction:
      'Measure vertically from the highest point of the shoulder seam (next to the collar rib) straight down to the bottom hem.',
  },
  {
    part: 'Shoulder',
    instruction:
      'Measure straight across the back from the left shoulder seam to the right shoulder seam.',
  },
  {
    part: 'Sleeve Length',
    instruction:
      'Measure from the outer shoulder drop seam straight down to the end of the sleeve cuff.',
  },
];

export const PRODUCT_SPECIFICATIONS = [
  { label: 'Product', value: 'Full-sleeve oversized T-shirt' },
  { label: 'Material', value: 'Premium Loopnet' },
  { label: 'Colourways', value: 'Off-White / Cream  •  Jet Black' },
  { label: 'Fit Profile', value: 'Relaxed oversized fit' },
  { label: 'Silhouette', value: 'Boxy drop-shoulder' },
  { label: 'Sleeve Embroidery', value: 'Floral embroidery on both sleeves' },
  { label: 'Chest Branding', value: 'STONCROPS (embroidered)' },
  { label: 'Edition', value: 'Embroidered Edition' },
  { label: 'Pricing', value: '₹1,199 (All Taxes Included)' },
  { label: 'Shipping', value: 'FREE across India' },
];
