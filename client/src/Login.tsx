// import './style/login.css'
import "./style/Navbar.css";


const Login = () =>
{

    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_CALLBACK_URL}/auth/42`;
    };
    return(
        <>
        <div className="bandroll">
            <h1 className="name">The White Rabbit Pong</h1>
        </div>
            <div className="bloc-welcome">
            <h1 className="welcome">Welcome Human, it's nice to see you! <br /> To start with your journey: </h1>
            <button className="login-button" onClick={handleLogin}>Login with 42</button>
            </div>
        </>
    );
}

export default Login;