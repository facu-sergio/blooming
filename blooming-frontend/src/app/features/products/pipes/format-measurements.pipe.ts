import { Pipe, PipeTransform } from '@angular/core';
import { ProductVariantMeasurement } from '../models/product.models';

@Pipe({ name: 'formatMeasurements', standalone: true })
export class FormatMeasurementsPipe implements PipeTransform {
  transform(measurements: ProductVariantMeasurement[]): string {
    return measurements
      .map((m) => `${m.name}: ${m.valueInCm % 1 === 0 ? m.valueInCm : m.valueInCm.toFixed(1)}cm`)
      .join(', ');
  }
}
