import createError from 'http-errors';
import { body } from 'express-validator';
import { isJsonString } from '../utils';
import authService from '../services/auth';
import { sign } from 'jsonwebtoken';
import CONFIG from '../config';
import { errorFirst as eF } from '../utils';
import { request200 } from '../request';

export const preAuthenticate = [
    body('code').notEmpty().withMessage('code is required').bail().isString().withMessage('code must be a string'),
];

const extractCustomAttributes = (userDetails) => {  
    userDetails = userDetails.body
    const userMetadata = userDetails['custom:Location']
    return {
      userMetadata,
      loginName: userDetails.email,
    };
};

const unAuthError = (error) => {
    if (isJsonString(error.message)) {
      const parsedErrorMessage = JSON.parse(error.message || '{}');
      const { data: { error: message = '' } = {} } = parsedErrorMessage;
      return createError(401, message, { expose: false });
    }
    return createError(401, error, { expose: false });
};


export const verifyAuthentication = async (req, res, next) => {
    const { code } = req.body;

    // STEP1: Exchange auth code for access token
    const accessTokenOptions = await authService.getAccessToken({
      code,
    });
    const [tokenError, tokenDetails] = await eF(request200(accessTokenOptions, req, res));
    if (tokenError) {
      return next(unAuthError(tokenError));
    }
  
    // STEP2: Get user details using above access token
    const accessToken  = tokenDetails.body.access_token;
    const tokenType = tokenDetails.body.token_type;
    const userDetailsOptions = await authService.getUserDetails({
      accessToken,
      tokenType,
    });
    const [errorUserDetails, userDetails] = await eF(request200(userDetailsOptions, req, res));
    if (errorUserDetails) {
      return next(unAuthError(errorUserDetails));
    }

    // STEP3: send the auth result
    const {userMetadata, loginName} = extractCustomAttributes(userDetails);
    const date = Date.now();
    const jwt = sign(
      {
        local: {
          userDetails,
          userMetadata,
          loginName,
          date,
        },
      },
      CONFIG.JWT_SECRET_PASS,
      { expiresIn: CONFIG.JWT_EXPIRY_TIME_IN_SEC }
    );
  
    return res.status(200).send({
      cognitoAccessToken: accessToken,
      userDetails,
      userDetailsOptions,
      token: jwt,
      tokenExpiresAt: date + CONFIG.JWT_EXPIRY_TIME_IN_SEC * 1000,
    });
  };