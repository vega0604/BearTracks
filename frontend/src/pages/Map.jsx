import styles from '@css/map.module.css';
import MapComponent from "./MapApi";
import light_paw from '@assets/logos/light_paw.svg';
import search_icon from '@assets/icons/search.svg';

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