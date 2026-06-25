let loadPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    if ((window as any).google && (window as any).google.maps) {
      resolve((window as any).google);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    const callbackName = '__googleMapsCallback';
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      resolve((window as any).google);
    };

    const script = document.createElement('script');
    // We import complete libraries needed: drawing and geometry
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=drawing,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = (err) => {
      console.error('Failed to load Google Maps JS SDK', err);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
