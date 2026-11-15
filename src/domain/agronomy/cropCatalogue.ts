import cropsData from '../../../data/crops.json';
import type { CropCatalogue, CropData } from '../../types/index';

export function getCropCatalogue(): CropCatalogue {
  const data = cropsData as {
    version: string;
    lastUpdated: string;
    crops: CropData[];
  };

  return {
    version: data.version || '1.0.0',
    lastUpdated: data.lastUpdated || '2026-11-15',
    crops: data.crops || [],
  };
}

export function getCropById(cropId: string): CropData | undefined {
  const catalogue = getCropCatalogue();
  return catalogue.crops.find((c) => c.id === cropId);
}
