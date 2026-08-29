import { useEffect, useRef, useState } from 'react'
import { AlertCircle, MapPinned } from 'lucide-react'
import type { BookedRide } from '../domain/admin'
import { getBookingStatusLabel } from '../domain/formatters'
import { loadGoogleMaps } from '../maps/googleMapsLoader'

interface GoogleRideMapProps {
  rides: BookedRide[]
  variant: 'compact' | 'full'
  onSelectRide?: (ride: BookedRide) => void
}

type MapLoadStatus = 'loading' | 'ready' | 'missing_key' | 'error'

const valenciaCenter = { lat: 7.9046, lng: 125.0928 }

const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#eeece5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#57564f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f8f7f2' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c9c7bd' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e2e3d3' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6a6a55' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d8d6ce' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f5ea8a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#dcdad2' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cbdcdf' }] },
]

export function GoogleRideMap({ rides, variant, onSelectRide }: GoogleRideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_WEB_API_KEY?.trim()
  const [loadStatus, setLoadStatus] = useState<MapLoadStatus>(
    apiKey ? 'loading' : 'missing_key',
  )

  useEffect(() => {
    const mapElement = mapContainerRef.current
    if (!mapElement || !apiKey) return

    let isCancelled = false
    const markers: google.maps.Marker[] = []
    const routeLines: google.maps.Polyline[] = []

    async function renderMap(container: HTMLDivElement, webApiKey: string) {
      try {
        const { maps, marker } = await loadGoogleMaps(webApiKey)
        if (isCancelled) return

        const map = new maps.Map(container, {
          center: valenciaCenter,
          zoom: variant === 'compact' ? 12 : 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: variant === 'full',
          zoomControl: variant === 'full',
          gestureHandling: variant === 'full' ? 'greedy' : 'cooperative',
          styles: mapStyles,
        })
        const bounds = new google.maps.LatLngBounds()

        rides.forEach((ride, index) => {
          const markerPosition = ride.riderCoordinates ?? ride.pickupCoordinates
          bounds.extend(ride.pickupCoordinates)
          bounds.extend(ride.destinationCoordinates)
          bounds.extend(markerPosition)

          const rideMarker = new marker.Marker({
            map,
            position: markerPosition,
            title: `${ride.id}: ${getBookingStatusLabel(ride.status)}`,
            label: {
              text: String(index + 1),
              color: '#ffff66',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: '700',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#1c1b1b',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
              scale: variant === 'compact' ? 11 : 12,
            },
            zIndex: rides.length - index,
          })

          if (onSelectRide) {
            rideMarker.addListener('click', () => onSelectRide(ride))
          }

          const routeLine = new maps.Polyline({
            map,
            path: [ride.pickupCoordinates, ride.destinationCoordinates],
            geodesic: true,
            strokeColor: index === 0 ? '#626200' : '#8d8d68',
            strokeOpacity: index === 0 ? 0.85 : 0.45,
            strokeWeight: index === 0 ? 4 : 3,
          })

          markers.push(rideMarker)
          routeLines.push(routeLine)
        })

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, variant === 'compact' ? 38 : 72)
        }

        setLoadStatus('ready')
      } catch {
        if (!isCancelled) setLoadStatus('error')
      }
    }

    void renderMap(mapElement, apiKey)

    return () => {
      isCancelled = true
      markers.forEach((markerItem) => markerItem.setMap(null))
      routeLines.forEach((routeLine) => routeLine.setMap(null))
    }
  }, [apiKey, onSelectRide, rides, variant])

  return (
    <div className={`google-ride-map google-ride-map-${variant} ${variant === 'full' ? 'panel' : ''}`}>
      <div ref={mapContainerRef} className="google-map-canvas" aria-label="Google map showing active Sakyan rides" />
      {loadStatus === 'loading' ? (
        <div className="map-state map-loading-state" role="status">
          <span className="map-loading-spinner" />
          <strong>Loading live map</strong>
        </div>
      ) : null}
      {loadStatus === 'missing_key' ? (
        <div className="map-state map-configuration-state">
          <MapPinned size={24} aria-hidden="true" />
          <strong>Google Maps is ready to connect</strong>
          <span>Add a website-restricted `GOOGLE_MAPS_WEB_API_KEY` to display live ride locations.</span>
        </div>
      ) : null}
      {loadStatus === 'error' ? (
        <div className="map-state map-error-state" role="alert">
          <AlertCircle size={24} aria-hidden="true" />
          <strong>Google Maps could not load</strong>
          <span>Check that the web key allows this domain and has Maps JavaScript API enabled.</span>
        </div>
      ) : null}
      {loadStatus === 'ready' ? (
        <div className="google-map-live-badge"><span className="pulse-dot" /> {rides.length} rides in progress</div>
      ) : null}
    </div>
  )
}
