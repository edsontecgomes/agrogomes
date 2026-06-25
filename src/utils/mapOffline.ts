/**
 * Utility for Leaflet Map Offline support
 */

const CACHE_NAME = 'map-tiles-cache';

/**
 * Converts latitude and longitude to tile coordinates
 */
export function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lng + 180) / 360 * n);
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

/**
 * Calculates the bounding box for a given radius in km
 */
export function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32; // 1 degree lat is approx 111.32km
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
  
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta
  };
}

/**
 * Downloads tiles for a specific area and zoom levels
 */
export async function downloadMapArea(
  centerLat: number, 
  centerLng: number, 
  radiusKm: number = 5, 
  minZoom: number = 13, 
  maxZoom: number = 18,
  onProgress?: (current: number, total: number) => void
) {
  const bbox = getBoundingBox(centerLat, centerLng, radiusKm);
  const cache = await caches.open(CACHE_NAME);
  
  const tilesToDownload: string[] = [];
  const baseUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const subdomains = ['a', 'b', 'c'];

  for (let z = minZoom; z <= maxZoom; z++) {
    const topLeft = latLngToTile(bbox.maxLat, bbox.minLng, z);
    const bottomRight = latLngToTile(bbox.minLat, bbox.maxLng, z);
    
    for (let x = topLeft.x; x <= bottomRight.x; x++) {
      for (let y = topLeft.y; y <= bottomRight.y; y++) {
        const s = subdomains[(x + y) % subdomains.length];
        const url = baseUrl
          .replace('{s}', s)
          .replace('{z}', z.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString());
        tilesToDownload.push(url);
      }
    }
  }

  const total = tilesToDownload.length;
  let current = 0;

  // Download in batches to avoid overwhelming the browser/network
  const batchSize = 10;
  for (let i = 0; i < tilesToDownload.length; i += batchSize) {
    const batch = tilesToDownload.slice(i, i + batchSize);
    await Promise.all(batch.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('Failed to download tile:', url, error);
      }
      current++;
      if (onProgress) onProgress(current, total);
    }));
  }
  
  return total;
}

/**
 * Checks if a tile is in cache
 */
export async function getCachedTile(url: string) {
  const cache = await caches.open(CACHE_NAME);
  return await cache.match(url);
}

/**
 * Clears the map tile cache
 */
export async function clearTileCache() {
  return await caches.delete(CACHE_NAME);
}
