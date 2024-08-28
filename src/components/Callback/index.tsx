import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {UserManager, WebStorageStateStore} from 'oidc-client';

const userManager = new UserManager({
    authority: 'https://auth.pingone.eu/cd63f986-b318-46dd-9f9d-281c51c35270/as/authorize',
    client_id: 'a5c8213d-af46-490b-bb94-4570ad55734c',
    redirect_uri: 'http://localhost:5173/callback',
    response_type: 'code',
    scope: 'openid profile',
    post_logout_redirect_uri: 'http://localhost:5173/',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
});

const Callback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const completeLogin = async () => {
            await userManager.signinRedirectCallback();
            navigate('/'); // Redirect to the home page after successful authentication
        };

        completeLogin();
    }, [navigate]);

    return (
        <div>
            <p>Completing login...</p>
        </div>
    );
};

export default Callback;
