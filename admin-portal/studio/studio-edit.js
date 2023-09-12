import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex, extractCityStateAndPincode, convertDateFormat, getCurrentMonth } from "../../helper.js";
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

export let options = {
    vus: 100,
    iterations: 100,
    duration: "1m",
    // rps: 100,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};

const baseUrl = "http://localhost";
let headers = { "Content-Type": "application/json" };
let XAccessToken;
let studioId;
let studioName;

export default function () {

let verifyPasswordPayload = JSON.stringify({
    email: "varun.v@gida.io",
    password: "Smart@1212",
    os: "web",
    deviceId: "web",
    osVersion: "web",
    manufacturer: "web",
});
const verifyPasswordResponse = http.post(
    `${baseUrl}/users/v1/public/verify-password`,
    verifyPasswordPayload,
    { headers }
);
check(verifyPasswordResponse, {
    "Verify Password status is 201": (res) => {
        return res.status === 201;
    },
});

const verifyOtpPayload = JSON.stringify({
    email: "varun.v@gida.io",
    otp: "123456",
    os: "web",
    deviceId: "web",
    osVersion: "web",
    manufacturer: "web",
});

const verifyOtp = http.post(
    `${baseUrl}/users/v1/public/verify-otp`,
    verifyOtpPayload,
    { headers }
);
if (verifyOtp.status === 201) {
    XAccessToken = verifyOtp.headers["X-Access-Token"];
    headers = {
        "Content-Type": "application/json",
        "X-Access-Token": XAccessToken,
    };
}
check(verifyOtp, {
    "Verify Otp status is 201": (res) => {
        return res.status === 201;
    },
});
let getStudioResponse = http.get(`${baseUrl}/master/v1/studio?offset=0&limit=10`, { headers });
console.log(getStudioResponse.json())
if(getStudioResponse.json().data.length > 0){
    let index = generateRandomIndex(getStudioResponse.json().data.length - 1)
    studioId = getStudioResponse.json().data[index].stateId;
    studioName = getStudioResponse.json().data[index].name;
}
check(getStudioResponse, { 'GET Studio Status is 200': (r) => r.status === 200 });

const editStudioPayload = JSON.stringify({
    "name": studioName,   
});
let patchStudioResponse = http.patch(`${baseUrl}/master/v1/studio/${studioId}`, editStudioPayload, { headers });
check(patchStudioResponse, { 'PATCH Studio Status is 200': (r) => r.status === 200 });


let getLocationResponse = http.get(`${baseUrl}/master/v1/location/pincode?pincode=560038`, { headers });
check(getLocationResponse, { 'GET Location Status is 200': (r) => r.status === 200 });

const postStudioPayload = {
    "name": "studio",
    "address": "dd",
    "area": "organic",
    "cityId": "0b3a1608-a588-415b-853d-8051d7e67768",
    "stateId": "6230c7c4-24ee-4017-99d9-b34ea81a4c22",
    "pincode": "560038",
    "daysOpen": ["Wednesday", "Thursday", "Friday"],
    "openingTime": "01:30 AM",
    "closingTime": "02:00 AM"
};
let postStudioResponse = http.post(`${baseUrl}/master/v1/studio`, JSON.stringify(postStudioPayload), { headers });
check(postStudioResponse, { 'POST Studio Status is 201': (r) => r.status === 201 });



}
function loginFlow() {
    
}

function studioEditFlow(){
    }