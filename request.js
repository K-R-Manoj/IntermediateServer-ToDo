import request from "request";

export const request200 = (option = {}, req = { id: "Unknown" }, res) =>
{
    return new Promise((resolve, reject) => {
        request(option, (error, response, body) => {
            return resolve({ body });
        })
    })
}