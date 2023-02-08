import CONFIG from "../config";

export const getAuthInfo = async () => {
    const baseUrl = 'https://todo-app-users.auth.us-east-1.amazoncognito.com';
    const clientId = CONFIG.CLIENT_ID;
    const clientSecret = CONFIG.CLIENT_SECRET;
    const redirectUri = 'http://localhost:4200';
    
    return {
        baseUrl,
        clientId,
        clientSecret,
        redirectUri,
        headers: {
          Authorization: `Basic ${Buffer.from([clientId, ':', clientSecret].join('')).toString('base64')}`,
        },
      };
};

const authService = {
    getAccessToken: async (params) => {
        const { code } = params;
        const authInfo = await getAuthInfo();
        let redirectUrl = authInfo.redirectUri;
        let redirectPath = 'callback';
   
        return {
          baseUrl: authInfo.baseUrl,
          uri: 'oauth2/token',
          form: {
            code,
            client_id: authInfo.clientId,
            grant_type: 'authorization_code',
            redirect_uri: `${redirectUrl}/${redirectPath}`,
          },
          method: 'POST',
          json: true,
          headers: {
            ...authInfo.headers,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        };
      },
      getUserDetails: async ({ accessToken, tokenType = 'Bearer' }) => {
        const authInfo = await getAuthInfo();
        return {
          baseUrl: authInfo.baseUrl,
          uri: 'oauth2/userInfo',
          method: 'GET',
          json: true,
          headers: {
            Authorization: `${tokenType} ${accessToken}`,
          },
        };
      },
}
export default authService;