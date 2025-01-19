import React, { useEffect, useRef, useState } from 'react';
import styles from '@css/brunochat.module.css';
import mapboxgl from 'mapbox-gl';
import SunCalc from 'suncalc';
import submit_img from '@assets/icons/submit.svg';
import 'mapbox-gl/dist/mapbox-gl.css';
import { askBruno } from '@requests/AskBruno';

const MapComponent = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [activeCategories, setActiveCategories] = useState(['food', 'parking', 'bus_stops', 'recreation', 'offices', 'arts_culture', 'bike_racks', 'studyspot', 'washrooms', 'elevators']);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [isDaytime, setIsDaytime] = useState(true);

  // Function to check if current time is between sunrise and sunset
  const checkDayTime = () => {
    const times = SunCalc.getTimes(new Date(), 43.468, -79.700); // Sheridan coordinates
    const now = new Date();
    return now > times.sunrise && now < times.sunset;
  };

  // Function to update map style based on time
  const updateMapStyle = () => {
    if (!mapRef.current) return;

    const isDaylight = checkDayTime();
    setIsDaytime(isDaylight);

    // Switch between light and dark styles
    const newStyle = isDaylight
      ? 'mapbox://styles/brandynsudjito/cm62z18cq000201s6hnsk58vc' // your day style
      : 'mapbox://styles/brandynsudjito/cm62z10ij00dk01s25fuj06n4'; // create and add your dark style ID

    mapRef.current.setStyle(newStyle);
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_KEY;

    const initialIsDaytime = checkDayTime();
    const initialStyle = initialIsDaytime
      ? 'mapbox://styles/brandynsudjito/cm62z18cq000201s6hnsk58vc'
      : 'mapbox://styles/brandynsudjito/cm62z10ij00dk01s25fuj06n4';


    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [-79.700, 43.468],
      zoom: 17,
      pitch: 40,
      maxZoom: 19, // Add this to limit zoom
      minZoom: 14
    });

    // Set up time checking interval
    const timeCheckInterval = setInterval(() => {
      updateMapStyle();
    }, 60000); // Check every minute

    // Add debug info for sunrise/sunset times
    const times = SunCalc.getTimes(new Date(), 43.468, -79.700);
    console.log('Sunrise:', times.sunrise);
    console.log('Sunset:', times.sunset);
    console.log('Current time:', new Date());
    console.log('Is daytime:', checkDayTime());


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
      // Remove or comment out your existing fetch code
      fetch('/data/map.geojson')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load GeoJSON');
          }
          return response.json();
        })
        .then(geojsonData => {
          console.log('GeoJSON data loaded:', geojsonData);

          // Add IDs to features if they don't have them
          geojsonData.features = geojsonData.features.map((feature, index) => ({
            ...feature,
            id: feature.id || index
          }));

          // Add the source
          mapRef.current.addSource('room-data', {
            type: 'geojson',
            data: geojsonData
          });

          // Add the extrusion layer
          mapRef.current.addLayer({
            'id': 'room-extrusion',
            'type': 'fill-extrusion',
            'source': 'room-data',
            'paint': {
              'fill-extrusion-color': [
                'case',
                ['boolean', ['feature-state', 'clicked'], false],
                ['get', 'color'],
                '#aaa' // Default color when not clicked
              ],
              'fill-extrusion-height': [
                'coalesce',
                ['get', 'height'],
                20 // Default height if height is null
              ],
              'fill-extrusion-base': [
                'coalesce',
                ['get', 'base_height'],
                0 // Default base_height if base_height is null
              ],
              'fill-extrusion-opacity': 0.7  // Use a simple number for opacity
            }
          });

          // Variable to store the ID of the currently clicked feature
          let clickedId = null;

          // Add click handler for the rooms
          mapRef.current.on('click', 'room-extrusion', (e) => {
            console.log('Click event:', e);
            console.log('Features:', e.features);
            if (e.features.length > 0) {
              e.preventDefault(); // Prevent the click from propagating

              const clickedFeature = e.features[0];

              // If we have a previously clicked feature, reset its state
              if (clickedId !== null) {
                mapRef.current.setFeatureState(
                  { source: 'room-data', id: clickedId },
                  { clicked: false }
                );
              }

              // Set the state of the clicked feature
              clickedId = clickedFeature.id;
              mapRef.current.setFeatureState(
                { source: 'room-data', id: clickedId },
                { clicked: true }
              );

              // Optional: Add popup with information
              // new mapboxgl.Popup()
              //   .setLngLat(e.lngLat)
              //   .setHTML(`
              //     <div style="padding: 10px;">
              //       <h3>${clickedFeature.properties.name || 'Area'}</h3>
              //       ${clickedFeature.properties.description ? 
              //         `<p>${clickedFeature.properties.description}</p>` : 
              //         ''}
              //     </div>
              //   `)
              //   .addTo(mapRef.current);
            }
          });

          // Add click handler for resetting when clicking elsewhere
          mapRef.current.on('click', (e) => {
            // Only run if we didn't click on a room
            if (!e.defaultPrevented && clickedId !== null) {
              mapRef.current.setFeatureState(
                { source: 'room-data', id: clickedId },
                { clicked: false }
              );
              clickedId = null;
            }
          });

          // Change cursor on hover
          mapRef.current.on('mouseenter', 'room-extrusion', () => {
            mapRef.current.getCanvas().style.cursor = 'pointer';
          });

          mapRef.current.on('mouseleave', 'room-extrusion', () => {
            mapRef.current.getCanvas().style.cursor = '';
          });
        })
        .catch(err => console.error('Error loading GeoJSON:', err));

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
      clearInterval(timeCheckInterval);
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

  // const toggleDayNight = () => {
  //   if (mapRef.current) {
  //     const newStyle = isDaytime
  //       ? 'mapbox://styles/brandynsudjito/cm62rxv5a005501s61hay352c'
  //       : 'mapbox://styles/brandynsudjito/cm62mfaq300em01s2cxa19qk0';
      
  //     mapRef.current.setStyle(newStyle);
  //     setIsDaytime(!isDaytime);
  //   }
  // };

  const [messageHistory, setMessageHistory] = useState([
    {
      role: 'model',
      message: 'Ask me anything about Sheridan!'
    }
  ])

  const [awaitingResponse, setAwaitingResponse] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    const question = e.target.question.value;
    let messages = messageHistory;
    messages.push({role: 'user', message: question})
    setMessageHistory(messages);
    e.target.reset();
    setAwaitingResponse(true);
    const response = await askBruno(question);
    messages.push({role: 'model', message: response.response});
    setMessageHistory(messages);
    setAwaitingResponse(false);

  }

  const [chatOpened, setChatOpened] = useState(false);
  const messageHistoryRef = useRef();

  useEffect(() => {
    if (messageHistoryRef.current){
      messageHistoryRef.current.scrollTop = messageHistoryRef.current.scrollHeight;
    }
  }, [messageHistory])
  return (
    <div>

      {/* Add toggle button for testing */}
      {/* <button
        onClick={toggleDayNight}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1,
          padding: '8px 16px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Toggle Day/Night
      </button> */}

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
          {['food', 'parking', 'bus_stops', 'recreation', 'offices', 'arts_culture', 'bike_racks', 'studyspot', 'washrooms', 'elevators'].map(category => (
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
            onClick={() => setActiveCategories(['food', 'parking', 'bus_stops', 'recreation', 'offices', 'arts_culture', 'bike_racks', 'studyspot', 'washrooms', 'elevators'])}
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
        <div id={styles.chat_container} data-opened={chatOpened} onFocus={() => setChatOpened(true)}>
          <h3>Ask Bruno</h3>
          <ul id={styles.message_history} ref={messageHistoryRef}>
            {messageHistory.map((item, i) => {
              return (
                <li key={i} className={`${styles.message} ${item.role == 'model' ? styles.model: styles.user}`}>{item.message}</li>
              );
            })}
            {/* {awaitingResponse && <div>...</div>} */}
          </ul>
          <div id={styles.form_container}>
            <form onSubmit={handleSubmit} id={styles.chat_form}>
              <input type="text" name="question" placeholder='ask a question...' />
              <button type="submit"><img src={submit_img} alt="submit" /></button>
            </form>
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