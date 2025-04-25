import React, { useState, useEffect } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer, LoadScript } from '@react-google-maps/api';
import styles from './MapPopup.module.css';

const MapPopup = ({ userLocation, sellerLocation, onClose }) => {
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [mapKey, setMapKey] = useState(Date.now()); // Key to force remount

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = {
    lat: (userLocation.lat + sellerLocation.lat) / 2,
    lng: (userLocation.lng + sellerLocation.lng) / 2,
  };

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
      setLoading(false);
    } else {
      setLoading(false); // Handle failed request
    }
  };

  // Reset map state when component mounts
  useEffect(() => {
    setDirections(null);
    setLoading(true);
    setMapKey(Date.now()); // Ensure fresh key on mount
  }, [userLocation, sellerLocation]);

  // Handle closing the map
  const handleClose = () => {
    setDirections(null);
    setLoading(true);
    setMapKey(Date.now()); // Reset key for next open
    onClose();
  };

  // Handle click outside to close (for mobile/desktop)
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains(styles.mapPopupOverlay)) {
      handleClose();
    }
  };

  return (
    <div className={styles.mapPopupOverlay} onClick={handleOverlayClick}>
      <div className={styles.mapPopupContent}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        {loading && <div className={styles.loading}>Loading map...</div>}
        <LoadScript googleMapsApiKey="AIzaSyB6MyHuGbmEQ1DevrMLF-E-Kfk6v7KIWjw">
          <GoogleMap
            key={mapKey}
            mapContainerStyle={mapContainerStyle}
            zoom={7}
            center={center}
          >
            {userLocation && sellerLocation && (
              <DirectionsService
                key={mapKey}
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
        </LoadScript>
      </div>
    </div>
  );
};

export default MapPopup;