// High quality agricultural imagery mapped to crops and farm landscapes
export const CROP_IMAGES: Record<string, string> = {
  paddy_rice:
    'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
  green_gram:
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
  black_gram:
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  cowpea:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  maize:
    'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  finger_millet:
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  groundnut:
    'https://images.unsplash.com/photo-1567892328127-18c32ec844bf?auto=format&fit=crop&w=600&q=80',
  soybean:
    'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?auto=format&fit=crop&w=600&q=80',
  sesame:
    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
  sunn_hemp:
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
  chilli:
    'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
  red_onion:
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
  tomato:
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
};

export const FARM_LANDSCAPES = [
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
];

export const getCropImage = (cropId: string): string => {
  return (
    CROP_IMAGES[cropId] ||
    'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80'
  );
};

export const getFieldLandscapeImage = (index: number): string => {
  return FARM_LANDSCAPES[index % FARM_LANDSCAPES.length];
};
