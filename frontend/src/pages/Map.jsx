import styles from '@css/map.module.css';
import MapComponent from "./MapApi";
import light_paw from '@assets/logos/light_paw.svg';
import search_icon from '@assets/icons/search.svg';
import dropdown from '@assets/icons/dropdown.svg';
import filters from '@assets/icons/filters.svg';

function Map() {
    return (
        <section id={styles.map_section}>
            <nav id={styles.nav_container}>
                <div id={styles.header}>
                    <div id={styles.logo}>
                        <img src={light_paw} alt="Paw icon"/>
                        <h1>BearTracks</h1>
                    </div>
                    <div id={styles.campus}>
                        <h2>Trafalgar 🍯</h2>
                    </div>
                </div>
                <div id={styles.search_bar}>
                    <input placeholder="Search..."/>
                    <img src={search_icon} alt="Search icon"/>
                </div>
                <div id={styles.options}>
                    <div className={styles.option}>
                        <label>Landmarks:</label>
                        <div>0 selected <img src={dropdown}/></div>
                    </div>
                    <div className={styles.option}>
                        <label>Sort by:</label>
                        <div>Name <img src={dropdown}/></div>
                    </div>
                    <div id={styles.filters_container} className={styles.option}>
                        <div><img src={filters} alt="filters icon"/> Filters</div>
                    </div>
                    
                </div>
            </nav>
            <div id={styles.map_wrapper}>
                <div id={styles.map_container}>
                    <MapComponent/>
                </div>
            </div>
        </section>
    );
}

export default Map;