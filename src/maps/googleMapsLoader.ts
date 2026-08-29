import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

export interface GoogleMapsLibraries {
  maps: google.maps.MapsLibrary
  marker: google.maps.MarkerLibrary
}

let librariesPromise: Promise<GoogleMapsLibraries> | null = null

export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsLibraries> {
  if (!librariesPromise) {
    setOptions({
      key: apiKey,
      v: 'weekly',
      language: 'en',
      region: 'PH',
      authReferrerPolicy: 'origin',
    })

    librariesPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
    ]).then(([maps, marker]) => ({ maps, marker }))
  }

  return librariesPromise
}
