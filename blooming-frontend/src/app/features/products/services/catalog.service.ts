import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ColorOption, SizeSystemOption, SizeOption } from '../models/catalog.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly _colors = signal<ColorOption[]>([]);
  private readonly _sizeSystems = signal<SizeSystemOption[]>([]);

  readonly colors = this._colors.asReadonly();
  readonly sizeSystems = this._sizeSystems.asReadonly();

  get allSizes(): SizeOption[] {
    return this._sizeSystems().flatMap(ss => ss.sizes);
  }

  async loadColors(): Promise<void> {
    const result = await firstValueFrom(
      this.http.get<ColorOption[]>(`${this.baseUrl}/api/colors`)
    );
    this._colors.set(result);
  }

  async loadSizeSystems(): Promise<void> {
    const result = await firstValueFrom(
      this.http.get<SizeSystemOption[]>(`${this.baseUrl}/api/size-systems`)
    );
    this._sizeSystems.set(result);
  }

  async loadAll(): Promise<void> {
    await Promise.all([this.loadColors(), this.loadSizeSystems()]);
  }

  getColorName(colorId: number): string {
    return this._colors().find(c => c.id === colorId)?.displayName ?? '';
  }

  getSizeName(sizeId: number): string {
    return this.allSizes.find(s => s.id === sizeId)?.displayName ?? '';
  }

  getSizeDescription(sizeId: number): string | undefined {
    return this.allSizes.find(s => s.id === sizeId)?.description;
  }
}
