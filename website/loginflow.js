import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomMobileNumber } from "../helper.js";

export let options = {
    vus: 5000,
    iterations: 5000,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};
let errorCounts = {};
const baseUrl = "https://antara-dev.in";
let headers = { "Content-Type": "application/json" };

let XAccessToken;

export default function () {
    const mobileNumber = generateRandomMobileNumber();
    const sentPayload = JSON.stringify({
        name: mobileNumber+"name",
        mobile: mobileNumber,
    });

    const sendOtpResponse = http.post(
        `${baseUrl}/users/v1/public/send-otp`,
        sentPayload,
        { headers }
    );
    if (
        sendOtpResponse.status >= 300 ||
        sendOtpResponse.status < 200
    ) {
        let errorMessage = response.body;
        if (errorMessage in errorCounts) {
            errorCounts[errorMessage]++;
        } else {
            errorCounts[errorMessage] = 1;
        }
    }
    check(sendOtpResponse, {
        "otp sent": (res) => {
            return res.status === 201;
        },
    });

    const verifyPayload = JSON.stringify({
        mobile: mobileNumber,
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
    if (verifyOtp.status === 201) {
        XAccessToken = verifyOtp.headers["X-Access-Token"];
        headers = {
            "Content-Type": "application/json",
            "X-Access-Token": XAccessToken,
        };
    }else{
        let errorMessage = response.body;
        if (errorMessage in errorCounts) {
            errorCounts[errorMessage]++;
        } else {
            errorCounts[errorMessage] = 1;
        }
    }

check(verifyOtp, {
    "otp verified": (res) => {
        return res.status === 201;
    },
});

const logoutResponse = http.post(
    `${baseUrl}/users/v1/public/logout`,
    JSON.stringify({}),
    { headers }
);
if (logoutResponse.status >= 300 || logoutResponse.status < 200) {
    let errorMessage = response.body;
        if (errorMessage in errorCounts) {
            errorCounts[errorMessage]++;
        } else {
            errorCounts[errorMessage] = 1;
        }
}
check(logoutResponse, {
    "Logout endpoint status is 201": (res) => {
        return res.status === 201;
    },
});
sleep(2);

}

export function teardown() {
    console.log(errorCounts);
}