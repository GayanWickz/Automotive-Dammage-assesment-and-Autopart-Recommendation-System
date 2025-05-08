import React, { useState, useEffect, useCallback, memo } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import styles from './MapPopup.module.css';

const MapPopup = ({ userLocation, sellerLocation, onClose }) => {
  const [directions, setDirections] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapContainerStyle = { width: '100%', height: '400px' };
  const center = userLocation && sellerLocation ? {
    lat: (userLocation.lat + sellerLocation.lat) / 2,
    lng: (userLocation.lng + sellerLocation.lng) / 2,
  } : { lat: 0, lng: 0 };

  const directionsCallback = useCallback((response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      setIsLoading(false);
    } else {
      setError('Failed to load directions. Please try again.');
      setIsLoading(false);
      console.error('DirectionsService error:', response);
    }
  }, []);

  useEffect(() => {
    console.log('MapPopup mounted');
    if (!userLocation || !sellerLocation) {
      setError('Invalid location data.');
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setError(null);
    }
    return () => console.log('MapPopup unmounted');
  }, [userLocation, sellerLocation]);

  const handleMapClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.mapPopupOverlay} onClick={handleMapClick}>
      <div className={styles.mapPopupContent}>
        <button className={styles.closeButton} onClick={onClose} title="Close Map">
          ×
        </button>
        {isLoading && <div className={styles.loadingOverlay}>Loading map...</div>}
        {error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={7}
            center={center}
            onClick={handleMapClick}
          >
            {userLocation && sellerLocation && (
              <DirectionsService
                options={{
                  destination: sellerLocation,
                  origin: userLocation,
                  travelMode: 'DRIVING',
                }}
                callback={directionsCallback}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        )}
      </div>
    </div>
  );
};

export default memo(MapPopup);