import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import useLocalStorage from "use-local-storage";

function Landing() {
    const [theme, setTheme] = useLocalStorage("theme", "light");
    
    const toggleTheme = () =>{
        setTheme(theme === "dark" ? "light": "dark");
    };

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    const {loginWithRedirect} = useAuth0();
    return (
        <>
        <button onClick={() => loginWithRedirect()}>Login</button>
        </>
    );
}

export default Landing;