import React from 'react';
import styles from '@css/loading.module.css';
import lightLogo from '../assets/logos/light_logo_full.svg';

const LoadingScreen = () => {
    return (
        <div id={styles.loading_screen}>
            <div id={styles.loading_container}>
                <img src={lightLogo} alt="logo" id={styles.loading_logo} />
                <div id={styles.loading_spinner}></div>
                <div className={styles.lds_default}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            </div>
        </div>
    );
};

export default LoadingScreen;