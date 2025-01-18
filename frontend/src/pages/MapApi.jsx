import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapComponent = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [activeCategories, setActiveCategories] = useState(['Food', 'Parking', 'Bus Stop', 'Recreation']);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_KEY;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/brandynsudjito/cm62mfaq300em01s2cxa19qk0',
      center: [-79.700, 43.468],
      zoom: 17,
      pitch: 40,
      maxZoom: 19, // Add this to limit zoom
      minZoom: 14
    });

    // Wait for style to load before setting up interactions
    mapRef.current.on('style.load', () => {
      console.log('Style loaded');
      setIsStyleLoaded(true);
      
      // Initial filter setup
      updateLayerFilter();

      // Log available layers
      const style = mapRef.current.getStyle();
      console.log('Available layers:', style.layers.map(layer => layer.id));
    });

    mapRef.current.on('load', () => {
      // Add click handler
      mapRef.current.on('click', (event) => {
        const features = mapRef.current.queryRenderedFeatures(event.point, {
          layers: ['sheridan-traf']
        });
      
        if (!features.length) return;
      
        const feature = features[0];
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
      
        new mapboxgl.Popup({
          offset: [0, -15],
          maxWidth: '300px',
          className: 'custom-popup'
        })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(popupContent)
          .addTo(mapRef.current);
      });
      
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Update filter when active categories change
  useEffect(() => {
    if (isStyleLoaded) {
      updateLayerFilter();
    }
  }, [activeCategories, isStyleLoaded]);

  const updateLayerFilter = () => {
    if (!mapRef.current || !isStyleLoaded) return;
    
    try {
      mapRef.current.setFilter('sheridan-traf', [
        'in',
        ['get', 'category'],
        ['literal', activeCategories]
      ]);
    } catch (error) {
      console.error('Error setting filter:', error);
    }
  };

  const toggleCategory = (category) => {
    setActiveCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      }
      return [...prev, category];
    });
  };

  return (
    <div>
      {/* Category Filter Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Filter Categories</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Food', 'Parking', 'Bus Stop', 'Recreation'].map(category => (
            <label
              key={category}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={activeCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                style={{ marginRight: '8px' }}
              />
              {category}
            </label>
          ))}
        </div>
        <div style={{ 
          marginTop: '12px',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveCategories(['Food', 'Parking', 'Bus Stop', 'Recreation'])}
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            Select All
          </button>
          <button
            onClick={() => setActiveCategories([])}
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%',
        }}
      />
    </div>
  );
};

export default MapComponent;