import React, { useState } from 'react';
import { GoogleMap, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const Nefie = ({ origin, destination }) => {
  const [directions, setDirections] = useState(null);

  const directionsCallback = (response) => {
    if (response !== null && response.status === 'OK') {
      setDirections(response);
    }
  };

  return (
    <div style={{ width: '300px', height: '300px', borderRadius: '10px', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        zoom={10}
        center={origin}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', 
        }}
      >
        <DirectionsService
          options={{
            destination: destination,
            origin: origin,
            travelMode: 'DRIVING',
          }}
          callback={directionsCallback}
        />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
};

export default Nefie;