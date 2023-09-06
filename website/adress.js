import http from "k6/http";
import { sleep, check } from "k6";
export let options = {
    vus: 1,
    iterations: 1,
    duration: "30s",
    // thresholds: {
    //     'http_req_duration': ['p(95)<3000']
    // }
};

 const baseUrl = "http://localhost";

let headers = { "Content-Type": "application/json" };
let XAccessToken;
let customerId;


export default function () {
    const sentPayload = JSON.stringify({
        mobile: "6362387858",
    });

    const sendOtpResponse = http.post(
        `${baseUrl}:3002/users/v1/public/send-otp`,
        sentPayload,
        { headers }
    );
    check(sendOtpResponse, {
        "otp sent": (res) => {
            return res.status === 201;
        },
    });

    //----------------------------------------------------------------
    const verifyPayload = JSON.stringify({
        mobile: "6362387858",
        otp: "123456",
        os: "android",
        deviceId: "1234567891",
        osVersion: "10",
        manufacturer: "samsung",
    });
    const verifyOtp = http.post(
        `${baseUrl}/users/v1/public/verify-otp`,
        verifyPayload,
        { headers }
    );
    check(verifyOtp, {
        "otp verified": (res) => {
            XAccessToken = res.headers["X-Access-Token"];
            customerId = res.json().user.customerId;
            headers = {
                "Content-Type": "application/json",
                "X-Access-Token": XAccessToken,
            };
            return res.status === 201;
        },
    });

const AddressPayload = JSON.stringify({
    "name": "Office",
    "address": "Dno 8 Wdno 147, Kambli Bazar, Ballari",
    "buildingNo": "7",
    "lat": 0,
    "lng": 0,
    "pincode": "560038",
    "city": "Bengaluru",
    "state": "Karnataka",
    "contactNumber": "6362387858",
    "customerName": "Saloni Jain"
})
const AddressResponse =  http.post(`${baseUrl}:3002/users/v1/profile/address`, AddressPayload, {
    headers,
});
console.log(AddressResponse.json()[0])
}