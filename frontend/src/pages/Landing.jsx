import { useAuth0 } from "@auth0/auth0-react";

function Landing() {
    const {loginWithRedirect} = useAuth0();
    return (
        <>
        Landing Works
        <button onClick={() => loginWithRedirect()}>Login</button>
        </>
    );
}

export default Landing;