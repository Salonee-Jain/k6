import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomMobileNumber } from "../helper.js";
import { Counter } from 'k6/metrics';

export let options = {
    vus: 5000,
    iterations: 5000,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};

const allErrors = new Counter('error_counter');

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
        error_counter.add(1, {tag: sendOtpResponse.json().message})
        console.log("Send OTP", sendOtpResponse.body);
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
        error_counter.add(1, {tag: verifyOtp.json().message})
        console.log("Verify Otp", verifyOtp.body);
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
    error_counter.add(1, {tag: logoutResponse.json().message})
    console.log(logoutResponse.body);
}
check(logoutResponse, {
    "Logout endpoint status is 201": (res) => {
        return res.status === 201;
    },
});
sleep(2);

}