export const productsConstants = {
  nameMaxLength: 100,
  categoryMaxLength: 100,
  sizeMaxLength: 50,
  colorMaxLength: 50,
  imageMaxSizeBytes: 5 * 1024 * 1024,
  allowedImageTypes: ['image/jpeg', 'image/png'],
} as const;
