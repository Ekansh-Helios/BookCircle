import React from 'react';
import { Link } from 'react-router-dom';    

function LandingScreen() {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Welcome to the Book Learning Application!</h1>
            <p>Explore a wide range of books and enhance your knowledge.</p>
            <Link to="/login">
                    <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
                </Link>
        </div>
    );
}

export default LandingScreen;