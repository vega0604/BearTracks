import React from 'react';
import MapComponent from "./MapApi";
import styles from './Map.module.css';

function Map() {
    return (
        <div>
            <div className={styles.nav_container}>
                <nav>

                </nav>
            </div>
            <div className={styles.map_container}>
                {/* PUT MAP COMPONENT HERE! */}
                <MapComponent/>
            </div>
        </div>
    );
}

export default Map;