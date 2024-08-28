import * as request from 'superagent';
import { verify } from 'jsonwebtoken';

const IdTokenVerifier = (config: { issuer: string }) => {
  const wellKnownConfigUrl = config.issuer + '/.well-known/openid-configuration'

   const retrieveKeys = async () => {
    const config = await request.get(wellKnownConfigUrl);
    const keysResponse = await request.get(config.body.jwks_uri);
    return keysResponse.body.keys;
  }

  const formatRSPublicKey = (rawKey) => {
    return [
      '-----BEGIN CERTIFICATE-----',
      ...rawKey.match(/.{1,64}/g),
      '-----END CERTIFICATE-----'
    ].join('\n');
  }

  /**
   * Verify whether token signature and other claims are valid.
   * @param token it token
   * @param options token claims to validate.  (i.e subject, issuer, audience etc )
   * @returns {Promise<*>}
   */
  const verifyToken = async (token, options) => {
    console.log('token', token);
    console.log('options', options);
    const keys = await retrieveKeys();
    return new Promise((resolve, reject) => {
      let decoded_token = null;
      for (let key of keys) {
        try {
          decoded_token =
              // Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw the error.
              verify(token.toString(), formatRSPublicKey(key.x5c[0]), options);
          break;
        } catch (error) {
          // We don't want to reject here, because there's an array of keys provided, and the correct
          // one might be in the middle.
        }
      }

      if (decoded_token) {
        resolve(decoded_token)
      } else {
        reject("Id token verification failed.");
      }
    });
  }

  return {
    verify: verifyToken
  }
}

export default IdTokenVerifier;
