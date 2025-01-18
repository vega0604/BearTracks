import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapComponent = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbmR5bnN1ZGppdG8iLCJhIjoiY202MmNxOXJhMHhhaDJqb2xxeHJ6cmlidiJ9.VRIXyfZdLePxoi-H07HSnQ';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/brandynsudjito/cm62jl44e004t01s666bjbw6e',
      center: [-79.700, 43.468],
      zoom: 17,
      pitch: 40
    });

    // Wait for map to load
    mapRef.current.on('load', () => {
      // Log layers for debugging
      const style = mapRef.current.getStyle();
      console.log('Loaded layers:', style.layers.map(layer => layer.id));

      // Add click event handler
      mapRef.current.on('click', (event) => {
        const features = mapRef.current.queryRenderedFeatures(event.point, {
          layers: ['sheridan-traf']
        });
      
        if (!features.length) {
          return;
        }
      
        const feature = features[0];
      
        // Create popup content with all available properties
        const popupContent = `
          <div style="font-family: Arial, sans-serif; padding: 10px;">
            <h3 style="color: #000000; margin: 0 0 8px 0; font-size: 16px;">
              ${feature.properties.title || 'No Title'}
            </h3>
            
            <p style="color: #666666; margin: 4px 0; font-size: 14px;">
              <strong>Category:</strong> ${feature.properties.category || 'N/A'}
            </p>
            
            <p style="color: #666666; margin: 4px 0; font-size: 14px;">
              <strong>Location:</strong> ${feature.properties.location || 'N/A'}
            </p>
            
            ${feature.properties.description ? `
              <p style="color: #666666; margin: 4px 0; font-size: 14px;">
                <strong>Description:</strong> ${feature.properties.description}
              </p>
            ` : ''}
            
            ${feature.properties.timeslot ? `
              <p style="color: #666666; margin: 4px 0; font-size: 14px;">
                <strong>Hours:</strong> ${feature.properties.timeslot}
              </p>
            ` : ''}
            
            ${feature.properties.state ? `
              <p style="color: #666666; margin: 4px 0; font-size: 14px;">
                <strong>State:</strong> ${feature.properties.state}
              </p>
            ` : ''}
            
            ${feature.properties.link ? `
              <p style="color: #666666; margin: 4px 0; font-size: 14px;">
                <a href="${feature.properties.link}" target="_blank" style="color: #0066cc; text-decoration: none;">
                  More Information →
                </a>
              </p>
            ` : ''}
          </div>
        `;
      
        // Create and show popup
        new mapboxgl.Popup({
          offset: [0, -15],
          maxWidth: '300px',
          className: 'custom-popup'
        })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(popupContent)
          .addTo(mapRef.current);
      });

      // Optional: Change cursor to pointer when hovering over POIs
      mapRef.current.on('mouseenter', 'your-points-layer', () => {
        mapRef.current.getCanvas().style.cursor = 'pointer';
      });

      mapRef.current.on('mouseleave', 'your-points-layer', () => {
        mapRef.current.getCanvas().style.cursor = '';
      });
    });

    // Debug: Log when the map style has loaded
    mapRef.current.on('style.load', () => {
      console.log('Style loaded');
      const style = mapRef.current.getStyle();
      });

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: '100%',
      }}
    />
  );
};

export default MapComponent;