import * as _ from 'lodash';
import { config } from '../config/app-config';
import * as querystring from 'querystring';
import * as restClient from 'superagent-bluebird-promise';

import { attributes, AuthConfig } from '../modules/auth/auth.service';
import securityHelper from '../common/security';

const authConfig: AuthConfig = config().auth;
const _authLevel = 'L2';

// function to prepare request for TOKEN API
export function createTokenRequest(code) {
  const cacheCtl = 'no-cache';
  const contentType = 'application/x-www-form-urlencoded';
  const method = 'POST';

  // assemble params for Token API
  const strParams =
    'grant_type=authorization_code' +
    '&code=' +
    code +
    '&redirect_uri=' +
    authConfig.myinfo.redirectUrl +
    '&client_id=' +
    authConfig.myinfo.clientId +
    '&client_secret=' +
    authConfig.myinfo.clientSecret;
  const params = querystring.parse(strParams);

  // assemble headers for Token API
  const strHeaders =
    'Content-Type=' + contentType + '&Cache-Control=' + cacheCtl;
  const headers = querystring.parse(strHeaders);

  // Add Authorisation headers for connecting to API Gateway
  let authHeaders = null;
  if (_authLevel == 'L2') {
    authHeaders = securityHelper.generateAuthorizationHeader(
      authConfig.myinfo.api.tokenUrl,
      params,
      method,
      contentType,
      _authLevel,
      authConfig.myinfo.clientId,
      authConfig.privateKey,
      authConfig.myinfo.clientSecret,
    );
  } else {
    throw new Error('Unknown Auth Level');
  }

  if (!_.isEmpty(authHeaders)) {
    _.set(headers, 'Authorization', authHeaders);
  }

  console.log('Request Header for Token API:'.green);
  console.log(JSON.stringify(headers));

  const request = restClient.post(authConfig.myinfo.api.tokenUrl);

  // Set headers
  if (!_.isUndefined(headers) && !_.isEmpty(headers)) request.set(headers);

  // Set Params
  if (!_.isUndefined(params) && !_.isEmpty(params)) request.send(params);

  return request;
}

// function to prepare request for PERSON API
function createPersonRequest(sub, validToken) {
  const url = authConfig.myinfo.api.personUrl + '/' + sub + '/';
  console.log('sub'.green, sub);
  const cacheCtl = 'no-cache';
  const method = 'GET';

  // assemble params for Person API
  const strParams =
    'client_id=' + authConfig.myinfo.clientId + '&attributes=' + attributes;

  const params = querystring.parse(strParams);

  // assemble headers for Person API
  const strHeaders = 'Cache-Control=' + cacheCtl;
  const headers = querystring.parse(strHeaders);

  // Add Authorisation headers for connecting to API Gateway
  const authHeaders = securityHelper.generateAuthorizationHeader(
    url,
    params,
    method,
    '', // no content type needed for GET
    _authLevel,
    authConfig.myinfo.clientId,
    authConfig.privateKey,
    authConfig.myinfo.clientSecret,
  );

  // NOTE: include access token in Authorization header as "Bearer " (with space behind)
  if (!_.isEmpty(authHeaders)) {
    _.set(headers, 'Authorization', authHeaders + ',Bearer ' + validToken);
  } else {
    _.set(headers, 'Authorization', 'Bearer ' + validToken);
  }

  console.log('Request Header for Person API:'.green);
  console.log(JSON.stringify(headers));
  // invoke person API
  const request = restClient.get(url);

  // Set headers
  if (!_.isUndefined(headers) && !_.isEmpty(headers)) request.set(headers);

  // Set Params
  if (!_.isUndefined(params) && !_.isEmpty(params)) request.query(params);

  return request;
}

export function callPersonAPI(accessToken, res) {
  console.log('AUTH_LEVEL:'.green, _authLevel);

  // validate and decode token to get SUB
  const decoded = securityHelper.verifyJWS(
    accessToken,
    authConfig.myinfo.signaturePublicCert,
  );
  if (decoded == undefined || decoded == null) {
    res.jsonp({
      status: 'ERROR',
      msg: 'INVALID TOKEN',
    });
  }

  console.log('Decoded Access Token:'.green);
  console.log(JSON.stringify(decoded));

  const sub = decoded.sub;
  if (sub == undefined || sub == null) {
    res.jsonp({
      status: 'ERROR',
      msg: 'SUB NOT FOUND',
    });
  }

  console.log('sub'.red, sub);

  // **** CALL PERSON API ****
  const request = createPersonRequest(sub, accessToken);

  // Invoke asynchronous call
  request.buffer(true).end(function (callErr, callRes) {
    if (callErr) {
      console.error('Person Call Error: ', callErr.status);
      console.error(callErr.response.req.res.text);
      res.jsonp({
        status: 'ERROR',
        msg: callErr,
      });
    } else {
      // SUCCESSFUL
      const data = {
        body: callRes.body,
        text: callRes.text,
      };
      const personData = data.text;
      if (personData == undefined || personData == null) {
        res.jsonp({
          status: 'ERROR',
          msg: 'PERSON DATA NOT FOUND',
        });
      } else {
        if (_authLevel == 'L2') {
          console.log('Person Data (JWE):'.green);
          console.log(personData);

          const jweParts = personData.split('.'); // header.encryptedKey.iv.ciphertext.tag
          securityHelper
            .decryptJWE(
              jweParts[0],
              jweParts[1],
              jweParts[2],
              jweParts[3],
              jweParts[4],
              authConfig.privateKey,
            )
            .then((personDataJWS) => {
              if (personDataJWS == undefined || personDataJWS == null) {
                res.jsonp({
                  status: 'ERROR',
                  msg: 'INVALID DATA OR SIGNATURE FOR PERSON DATA',
                });
              }
              console.log('Person Data (JWS):'.green);
              console.log(JSON.stringify(personDataJWS));

              const decodedPersonData = securityHelper.verifyJWS(
                personDataJWS,
                authConfig.myinfo.signaturePublicCert,
              );
              if (decodedPersonData == undefined || decodedPersonData == null) {
                res.jsonp({
                  status: 'ERROR',
                  msg: 'INVALID DATA OR SIGNATURE FOR PERSON DATA',
                });
              }

              console.log('Person Data (Decoded):'.green);
              console.log(JSON.stringify(decodedPersonData));
              // successful. return data back to frontend
              res.jsonp({
                status: 'OK',
                text: decodedPersonData,
              });
            })
            .catch((error) => {
              console.error('Error with decrypting JWE: %s'.red, error);
            });
        } else {
          throw new Error('Unknown Auth Level');
        }
      } // end else
    }
  }); //end asynchronous call
}
