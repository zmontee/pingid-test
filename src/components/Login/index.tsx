import React, { useEffect } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client';

const userManager = new UserManager({
    authority: 'http://localhost:8010/proxy/cd63f986-b318-46dd-9f9d-281c51c35270/as/authorize',
    client_id: 'ccc86b9b-7aca-4851-b248-c63f3d66780c',
    redirect_uri: 'http://localhost:5173/callback',
    response_type: 'code',
    scope: 'openid profile',
    post_logout_redirect_uri: 'http://localhost:5173/',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
});

const Login: React.FC = () => {
    useEffect(() => {
        const login = async () => {
            await userManager.signinRedirect();
        };

        login();
    }, []);

    return (
        <div>
            <p>Redirecting to PingID for login...</p>
        </div>
    );
};

export default Login;
