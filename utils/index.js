export const errorHandle = (func) => (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch(next);
};

export const errorFirst = (promise) => promise.then((x) => [null, x]).catch((x) => [x, {}]);

export const isJsonString = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
};