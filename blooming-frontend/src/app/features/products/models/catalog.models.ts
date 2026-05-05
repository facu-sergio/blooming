export interface ColorOption {
  id: number;
  name: string;
  displayName: string;
  sortOrder: number;
}

export interface SizeOption {
  id: number;
  name: string;
  displayName: string;
  sortOrder: number;
  description?: string;
}

export interface SizeSystemOption {
  id: number;
  name: string;
  displayName: string;
  sizes: SizeOption[];
}
