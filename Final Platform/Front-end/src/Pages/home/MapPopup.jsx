import React, { useState, useEffect } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import styles from './MapPopup.module.css';

const MapPopup = ({ userLocation, sellerLocation, onClose }) => {
  const [directions, setDirections] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerStyle = { width: '100%', height: '400px' };
  const center = {
    lat: (userLocation.lat + sellerLocation.lat) / 2,
    lng: (userLocation.lng + sellerLocation.lng) / 2,
  };

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation && sellerLocation) {
      setIsLoading(true);
    }
  }, [userLocation, sellerLocation]);

  return (
    <div className={styles.mapPopupOverlay}>
      <div className={styles.mapPopupContent}>
        <button className={styles.closeButton} onClick={onClose} title="Close Map">
          ×
        </button>
        {isLoading && <div className={styles.loadingOverlay}>Loading map...</div>}
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={7} center={center}>
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
      </div>
    </div>
  );
};

export default MapPopup;