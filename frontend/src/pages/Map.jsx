import { useState, useEffect } from 'react';
import useLocalStorage from "use-local-storage";
import styles from '@css/map.module.css';
import MapComponent from "@pages/MapApi";
import light_paw from '@assets/logos/light_paw.svg';
import search_icon from '@assets/icons/search.svg';
import dropdown from '@assets/icons/dropdown.svg';
import filters from '@assets/icons/filters.svg';
import new_tab_arrow from '@assets/icons/new_tab_arrow.svg';
import trafalgar from '@data/trafalgar.json';

const LandmarkCategory = ({ category, data, onCategoryClick }) => {
    const numSpots = data.spots.length;
    const numSpotsWithLinks = data.spots.filter((spot) => spot.link).length;
    const [expanded, setExpanded] = useState(false);

    const handleClick = () => {
        setExpanded(!expanded);
        onCategoryClick(category);
    };

    return (
        <div className={styles.landmark_category} tabIndex="0">
            <div className={styles.landmark_category_header}  onClick={handleClick}>
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
                            <div className={styles.expanded_landmark} key={index}>
                                <p>{spot.title} <span>· {spot.location}</span></p>
                                {spot.link && (
                                    console.log(spot.link),
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

const LandmarkList = ({ onCategoryClick }) => {
    return (
        <div id={styles.landmarks_list}>
            <div className={styles.top_gradient} />
            {Object.entries(trafalgar[0].landmarks).map(([category, data]) => (
                <LandmarkCategory
                    key={category}
                    category={category}
                    data={data}
                    onCategoryClick={onCategoryClick}
                />
            ))}
            <div className={styles.bottom_gradient} />
        </div>
    );
};

const ExpandedLandmarkList = ({ selectedCategory }) => {
    const selectedData = trafalgar[0].landmarks[selectedCategory];

    if (!selectedData) {
        return null;
    }

    return (
        <div className={styles.expanded_landmarks_container}>
            {selectedData.spots.map((spot, index) => (
                <div className={styles.expanded_landmark} key={index}>
                    {spot.title}
                </div>
            ))}
        </div>
    );
};

function Map() {
    const [theme, setTheme] = useLocalStorage("theme", "light");
    
    const toggleTheme = () =>{
        setTheme(theme === "dark" ? "light": "dark");
    };

    useEffect(() => {
        setTheme("dark");
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <section id={styles.map_section} data-theme={theme}>
            <nav id={styles.nav_container}>
                <div id={styles.header}>
                    <div id={styles.logo}>
                        <img src={light_paw} alt="Paw icon" />
                        <h1>BearTracks</h1>
                    </div>
                    <div id={styles.campus}>
                        <h2>Trafalgar 🍯</h2>
                    </div>
                </div>
                <div id={styles.search_bar}>
                    <input placeholder="Search..." />
                    <img src={search_icon} alt="Search icon" />
                </div>
                <div id={styles.options}>
                    <div className={styles.option}>
                        <label>Landmarks:</label>
                        <div>0 selected <img src={dropdown} /></div>
                    </div>
                    <div className={styles.option}>
                        <label>Sort by:</label>
                        <div>Name <img src={dropdown} /></div>
                    </div>
                    <div id={styles.filters_container} className={styles.option}>
                        <div><img src={filters} alt="filters icon" /> Filters</div>
                    </div>
                </div>
                <div id={styles.landmarks_list_container}>
                    <LandmarkList />
                </div>
                <div id={styles.bottom_gradient}/>
            </nav>
            <div id={styles.map_wrapper}>
                <div id={styles.map_container}>
                    <MapComponent />
                </div>
            </div>
        </section>
    );
}

export default Map;