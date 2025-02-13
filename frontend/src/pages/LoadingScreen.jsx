import styles from '@css/loading.module.css';
// import light_paw from '@assets/logos/light_paw.svg';
import light_logo_full from '@assets/logos/light_logo_full.svg';

const LoadingScreen = () => {
    return (
        <div id={styles.loading_screen}>
            <div id={styles.loading_container}>
                <div id={styles.loading_logo} >
                    <img src={light_logo_full}/>
                    {/* <img src={light_paw} alt="Paw icon"/> */}
                    {/* <h1>BearTracks</h1> */}
                </div>
                <div id={styles.loading_spinner}></div>
                <div className={styles.lds_default}>
                    <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;