// import http from "k6/http";
// import { sleep, check } from "k6";
// import { generateRandomIndex, extractCityStateAndPincode, convertDateFormat, getCurrentMonth } from "../../helper.js";
// import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

// export let options = {
//     vus: 10,
//     iterations: 10,
//     duration: "1s",
//     // rps: 100,
//     thresholds: {
//         http_req_receiving: ["p(95)<300"],
//     },
// };
// const baseUrl = "http://localhost";
// let headers = { "Content-Type": "application/json" };
// let XAccessToken;



// function loginFlow() {
//     let verifyPasswordPayload = JSON.stringify({
//         email: "varun.v@gida.io",
//         password: "Smart@1212",
//         os: "web",
//         deviceId: "web",
//         osVersion: "web",
//         manufacturer: "web",
//     });
//     const verifyPasswordResponse = http.post(
//         `${baseUrl}/users/v1/public/verify-password`,
//         verifyPasswordPayload,
//         { headers }
//     );
//     check(verifyPasswordResponse, {
//         "Verify Password status is 201": (res) => {
//             return res.status === 201;
//         },
//     });

//     const verifyOtpPayload = JSON.stringify({
//         email: "varun.v@gida.io",
//         otp: "123456",
//         os: "web",
//         deviceId: "web",
//         osVersion: "web",
//         manufacturer: "web",
//     });

//     const verifyOtp = http.post(
//         `${baseUrl}/users/v1/public/verify-otp`,
//         verifyOtpPayload,
//         { headers }
//     );
//     if (verifyOtp.status === 201) {
//         XAccessToken = verifyOtp.headers["X-Access-Token"];
//         headers = {
//             "Content-Type": "application/json",
//             "X-Access-Token": XAccessToken,
//         };
//     }
//     check(verifyOtp, {
//         "Verify Otp status is 201": (res) => {
//             return res.status === 201;
//         },
//     });
// }
// export default function () {
//     loginFlow()
//     const postCache1Response = http.post(`${baseUrl}/data-sync/v1/admin-controls/rehydrate-specific-cache?modelName=customer`, null, { headers });
//     sleep(60000);
//     check(postCache1Response, { 'POST Cache1 Status is 200': (r) => r.status === 200 });
  

//     const postCache2Response = http.post(`${baseUrl}/data-sync/v1/admin-controls/rehydrate-cache`, null, { headers });
//     check(postCache2Response, { 'POST Cache2 Status is 200': (r) => r.status === 200 });
//     sleep(60000);
// }


