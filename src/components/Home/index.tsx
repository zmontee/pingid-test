import React, {useEffect, useState} from 'react';
import authClient from '../../sdk/api.ts';
import _ from "lodash";
import config from "../../config.ts";
import InfoTable from "../InfoTable";

const Home: React.FC = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [idToken, setIdToken] = useState(null);
    const [idTokenJson, setIdTokenJson] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const clearSession = () => {
        setAccessToken(null);
        setIdToken(null);
        setErrorMessage('');
    }

    const handleSignIn = () => {
        clearSession();
        let state = authClient.generateRandomValue();
        let nonce = authClient.generateRandomValue();
        // Store state and nonce parameters into the session, so we can retrieve them after
        // user will be redirected back with access token or code (since react state is cleared in this case)
        sessionStorage.setItem("state", state);
        sessionStorage.setItem("nonce", nonce);

        authClient.authorize(state, nonce);
    }

    const handleSignOff = () => {
        if (idToken) {
            authClient.signOff(idToken, sessionStorage.getItem("state"));
        }
        clearSession();
    }

    const verifyToken = (paramIdToken) => {
        authClient.verifyIdToken(paramIdToken,
            {
                nonce: sessionStorage.getItem("nonce"),
                maxAge: config.maxAge
            })
            .then(resIdToken => {
                setIdTokenJson(resIdToken)
            })
            .catch(error => {
                setErrorMessage("Id token verification failed. " + _.get(error,
                    'error_description', _.get(error, 'message', error)));
            })
    }

    const handleUserInfo = (paramAccessToken) => {
        authClient.getUserInfo(paramAccessToken)
            .then(result => {
                setUserInfo(result);
            })
            .catch(error => {
                const errorDetail = _.get(error, 'details[0].code', null);
                if (_.isEqual(errorDetail, 'INVALID_VALUE')) {
                    if (_.get(error, 'details[0].message', null).includes(
                        "Access token expired")) {
                        setErrorMessage('Your access token is expired. Please login again.')
                    } else {
                        setErrorMessage(_.get(error, 'details[0].message', null))
                    }
                } else if (errorDetail) {
                    setErrorMessage(errorDetail + _.get(error, 'details[0].message', null))
                } else if (_.get(error, 'error', null) || _.get(error,
                    'error_description', null)) {
                    setErrorMessage(_.get(error, 'error', null) + ': ' + _.get(error,
                        'error_description', null))
                }
                return Promise.reject(error);
            })
    }

    useEffect(() => {
        const hashes = authClient.parseHash();

        console.log('hashes', hashes);

        if (hashes.error && hashes.error_description) {
            setErrorMessage(hashes.error + ': ' + hashes.error_description)
            return;
        }

        const stateMatch = window.location.href.match('[?#&]state=([^&]*)');
        if (stateMatch && !stateMatch[1] &&
            !_.isEqual(stateMatch[1], sessionStorage.getItem("state"))) {
            setErrorMessage("State parameter mismatch. ")
            clearSession();
            return;
        }

        const codeMatch = window.location.href.match('[?#&]code=([^&]*)');
        // Implicit flow: access token is present in URL
        if (hashes.access_token) {
            setAccessToken(hashes.access_token);
            handleUserInfo(hashes.access_token);
        }
        // Authorization code flow: access code is present in URL
        else if (codeMatch && codeMatch[1]) {
            authClient.getAccessToken(codeMatch[1])
                .then(token => {
                    setAccessToken(token.access_token);
                    setIdToken(token.id_token);

                    handleUserInfo(token.access_token);
                    verifyToken(token.id_token);
                })
                .catch(error => {
                    setErrorMessage("Couldn't get an access token. " + _.get(error,
                        'error_description', _.get(error, 'message', '')))
                });
        }

        if (hashes.id_token) {
            verifyToken(hashes.id_token);
        }
        // Replace current URL without adding it to history entries
        window.history.replaceState({}, '', '/');
    }, []);

    const alert = errorMessage && (
        <div className="alert alert-danger">{errorMessage}</div>
    );

    const content = accessToken ?
        (
            <div className="home-app">
                <em>
                    Congratulations! This is a secure resource.
                </em>
                <p/>
                <div className="input-field">
                    <button type="button" onClick={handleSignOff}> Sign Off
                    </button>
                </div>
                <InfoTable btnLabel={'User Information'} data={userInfo}/>
                <InfoTable btnLabel={'User Id Token Information'}
                           data={idTokenJson}/>
            </div>
        ) :
        (
            <div id="signInView">
                <p>You are not currently authenticated. Click Sign On to get
                    started.</p>
                <div className="input-field">
                    <button type="button" onClick={handleSignIn}>Sign On
                    </button>
                </div>
            </div>
        );

    return (
        <div className="container">
            <h1>PingOne for Customers OIDC Sample</h1>
            {alert}
            {content}
        </div>
    )
};

export default Home;