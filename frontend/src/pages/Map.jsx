import { useState, useEffect, useContext, createContext, useRef } from 'react';
import useLocalStorage from "use-local-storage";
import styles from '@css/map.module.css';
import MapComponent from "@pages/MapApi";
import light_paw from '@assets/logos/light_paw.svg';
import search_icon from '@assets/icons/search.svg';
import dropdown from '@assets/icons/dropdown.svg';
import filters from '@assets/icons/filters.svg';
import new_tab_arrow from '@assets/icons/new_tab_arrow.svg';
import trafalgar from '@data/trafalgar.json';
import hmc from '@data/hmc.json';
import { Command } from 'cmdk';
import { Popover, Button } from "antd";

const LandmarkContext = createContext(null);

const LandmarkCategory = ({ category, data}) => {
    const {setSelectedLandmark} = useContext(LandmarkContext);
    const numSpots = data?.spots?.length || 0; 
    const numSpotsWithLinks = data?.spots?.filter((spot) => spot.link)?.length || 0;
    const [expanded, setExpanded] = useState(false);

    const handleClick = () => {
        setExpanded(!expanded);
    };

    return (
        <div className={styles.landmark_category} tabIndex="0">
            <div className={styles.landmark_category_header} onClick={handleClick}>
                <div className={styles.landmark_category_container}>
                    <div className={styles.landmark_icon} style={{ backgroundColor: `${data.color}7d` }}>
                        {data.emoji}
                    </div>
                    <div className={styles.landmark_info}>
                        <h3>{category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}</h3>
                        <p>{numSpots} locations, {numSpotsWithLinks} with links</p>
                    </div>
                </div>
                <img
                    src={dropdown}
                    alt="Dropdown icon"
                    style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-180deg)' }}
                />
            </div>
            {expanded && (
                <div className={styles.expanded_landmarks}>
                    {data.spots
                        .slice()
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map((spot, index) => (
                            <div className={styles.expanded_landmark} key={index} onClick={() => setSelectedLandmark(spot)}>
                                <p>{spot.title} <span>· {spot.location}</span></p>
                                {spot.link && (
                                    // console.log(spot.link),
                                    <a href={spot.link} target="_blank" rel="noopener noreferrer">
                                        <img src={new_tab_arrow} alt="Open in new tab" />
                                    </a>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

const LandmarkList = ({ activeCategories, sortBy, campus }) => {
    const campusData = campus === 'Trafalgar 🍯' ? trafalgar[0] : hmc[0]; 
    const selectedLandmarks = Object.entries(campusData.landmarks)
      .filter(([category, _]) => activeCategories.includes(category));
  
    const sortedLandmarks = sortLandmarks(selectedLandmarks, sortBy);

    return (
        <div id={styles.landmarks_list}>
            <div className={styles.top_gradient} />
            {sortedLandmarks.map(([category, data]) => (
                <LandmarkCategory
                    key={category}
                    category={category}
                    data={data}
                />
            ))}
            <div className={styles.bottom_gradient} />
        </div>
    );
};

function sortLandmarks(landmarks, sortBy) {
    switch (sortBy) {
        case 'Locations':
            return landmarks.slice().sort((a, b) => b[1].spots.length - a[1].spots.length);
        case 'Name (A-Z)':
            return landmarks.slice().sort((a, b) => a[0].localeCompare(b[0]));
        case 'Name (Z-A)':
            return landmarks.slice().sort((a, b) => b[0].localeCompare(a[0]));
        default:
            return landmarks;
    }
}

function Map() {
    const [campus, setCampus] = useState('Trafalgar 🍯');
    const [sortBy, setSortBy] = useState('Locations');

    const handleCampusChange = (campus) => {
        setCampus(campus);
        fetch(campus === 'Trafalgar 🍯' ? 'trafalgar.json' : 'hmc.json')
          .then(response => response.json())
          .then(data => {
            setLandmarks(data.landmarks);
            setSelectedLandmark(data.landmarks[0]);
          });
      };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const sortOptions = [
        { value: 'Locations', label: 'Number of Locations' },
        { value: 'Name (A-Z)', label: 'Name (A-Z)' },
        { value: 'Name (Z-A)', label: 'Name (Z-A)' },
    ];
      const sortContent = (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortOptions.map(option => (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={handleSortChange}
                  style={{ marginRight: '8px' }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      );

    const [theme, setTheme] = useLocalStorage("theme", "dark");
    const [open, setOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const landmarks = Object.values(trafalgar[0].landmarks).flatMap((category) => category.spots);
    const filteredLandmarks = landmarks.filter((landmark) =>
        landmark.title.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    useEffect(() => {
        // setTheme("dark");
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    const categories = ['food', 'parking', 'bus_stops', 'recreation', 'offices', 'arts_and_culture', 'bike_racks', 'study_spots', 'washrooms', 'elevators'];
    const [activeCategories, setActiveCategories] = useState(categories);

    const toggleCategory = (category) => {
        setActiveCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(cat => cat !== category);
            }
            return [...prev, category];
        });
    };

    const content = (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map(category => (
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
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}
                </label>
              ))}
            </div>
            <div style={{
                marginTop: '12px',
                display: 'flex',
                gap: '8px'
            }}>
                <button
                    onClick={() => setActiveCategories(categories)}
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
    );

    function Campus({ campus, handleCampusChange }) {
        const campuses = ['Trafalgar 🍯', 'HMC 👵'];
      
        return (
          <div id={styles.campus}>
            <h2 onClick={() => handleCampusChange(campus)}>{campus}</h2>
          </div>
        );
      }

    const [selectedLandmark, setSelectedLandmark] = useState(null);
    const [navOpened, setNavOpened] = useState(false);
    const containerElement = useRef(null);

    return (
        <section id={styles.map_section} data-theme={theme}>
            <nav id={styles.nav_container} data-opened={navOpened} tabIndex="0" onClick={(e) => e.target.focus()} onFocus={() => setNavOpened(true)}>
                <div id={styles.header}>
                    <div id={styles.logo}>
                        <img src={light_paw} alt="Paw icon" />
                        <h1>BearTracks</h1>
                    </div>
                    <Campus campus={campus} onCampusChange={handleCampusChange}/>
                </div>
                <div id={styles.search_bar_container} ref={containerElement}>
                    <div id={styles.search_bar} onClick={() => setOpen(true)}>
                        {open ? '': "Search..."}
                        <Command.Dialog
                            open={open}
                            onOpenChange={setOpen}
                            label="Landmarks"
                            id={styles.cmdk_dialog}
                            container={containerElement.current}
                        >
                                <Command.Input
                                    value={searchTerm}
                                    onValueChange={setSearchTerm}
                                    placeholder="Search..."
                                    className={styles.cmdk_input}
                                />
                            <Command.List className={styles.cmdk_list}>
                                <Command.Item className={styles.cmdk_list_item} onSelect={toggleTheme}>
                                    {theme == 'light'? '🌑 ':'🌞 '}
                                    Toggle Theme
                                </Command.Item>
                                { filteredLandmarks.map((landmark, i) => (
                                    <Command.Item key={i} className={styles.cmdk_list_item} onSelect={() => setSelectedLandmark(landmark)}>
                                        {landmark.title}

                                    </Command.Item>
                                ))}
                            </Command.List>
                        </Command.Dialog>
                        <img src={search_icon} alt="Search icon" />
                    </div>
                </div>

                <div id={styles.options}>
                    <div className={styles.option}>
                        <label>Landmarks:</label>
                        <Popover content={content} title="Landmark Categories" trigger="click">
                            <Button className={styles.option}>{activeCategories.length} selected</Button>
                        </Popover>
                    </div>
                    <div className={styles.option}>
                        <label>Sort by:</label>
                        <Popover content={sortContent} title="Sort Options" trigger="click">
                            <Button className={styles.option}>{sortBy}</Button> 
                        </Popover>
                    </div>
                    <div id={styles.filters_container} className={styles.option}>
                        <div><img src={filters} alt="filters icon" /> Filters</div>
                    </div>
                </div>
                <div id={styles.landmarks_list_container}>
                    <LandmarkContext.Provider value={{setSelectedLandmark: setSelectedLandmark}}>
                        <LandmarkList activeCategories={activeCategories} sortBy={sortBy} campus={campus}/>
                    </LandmarkContext.Provider>
                </div>
                <div id={styles.bottom_gradient} />
            </nav>
            <div id={styles.map_wrapper} tabIndex="0" onClick={(e) => e.target.focus()} onFocus={() => setNavOpened(false)}>
                <div id={styles.map_container}>
                    <MapComponent activeCategories={activeCategories} selectedLandmark={selectedLandmark} campus={campus}/>
                </div>
            </div>
        </section>
    );
}

export default Map;