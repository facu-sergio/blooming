export interface ColorOption {
  id: number;
  name: string;
  displayName: string;
  sortOrder: number;
}

export interface ColorAdmin {
  id: number;
  name: string;
  displayName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateColorDto {
  name: string;
  displayName?: string;
  sortOrder?: number;
}

export interface UpdateColorDto {
  name?: string;
  displayName?: string;
  sortOrder?: number;
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
