import http from "k6/http";
import { sleep, check } from "k6";

export let options = {
    vus: 1,
    iterations: 1,
    duration: "1s",
    // rps: 100,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};
const baseUrl = "http://localhost";
let headers = { "Content-Type": "application/json" };
let XAccessToken;
let searchName = "Mandanna";
let customerId;
let mode = 'Online'
let conditionIds;
let search = 'or';
let pincode = '560038';
let cityId;
let stateId;
let city;
let state;
let placesId;
let Address;
let mobileNumber;
let addressId;
let customerName;
let expertId
let expertName;
let slot;
let appointmentId;
let studioId;
let studioName;
let email;

export default function () {
    loginFlow();
    studioCreationFlow();
}

function loginFlow() {
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
}


function studioCreationFlow(){
   

    let getLocationResponse = http.get(`${baseUrl}/master/v1/location/pincode?pincode=${pincode}`, { headers });
    if(getLocationResponse.status == 400){
        pincode = '560038'
        cityId = '0b3a1608-a588-415b-853d-8051d7e67768'
        stateId = '6230c7c4-24ee-4017-99d9-b34ea81a4c22'
    }else{
        pincode = getLocationResponse.json().pincode
        cityId = getLocationResponse.json().city.cityId
        stateId = getLocationResponse.json().city.stateId
        check(getLocationResponse, { 'GET Location Status is 200': (r) => r.status === 200 });
    }
  

    const postStudioPayload = {
        "name": "studio",
        "address": "dd",
        "area": "organic",
        "cityId": cityId,
        "stateId": stateId,
        "pincode": pincode,
        "daysOpen": ["Wednesday", "Thursday", "Friday"],
        "openingTime": "06:30 PM",
        "closingTime": "07:00 PM"
    };
    let postStudioResponse = http.post(`${baseUrl}/master/v1/studio`, JSON.stringify(postStudioPayload), { headers });
    check(postStudioResponse, { 'POST Studio Status is 201': (r) => r.status === 201 });


}