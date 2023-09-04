import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomMobileNumber } from './helper.js'


export let options = {
    vus: 1000, 
    iterations: 1000,
    duration: '100s',
    rps: 100,
     thresholds: {
        'http_req_receiving': ['p(95)<300']
    }
};
const mobileNumber =  generateRandomMobileNumber();
const baseUrl = 'https://antara-dev.in';
let headers = { 'Content-Type': 'application/json' };
const sentPayload = JSON.stringify({
    mobile: mobileNumber
})
let  XAccessToken;
const verifyPayload = JSON.stringify({
    "mobile":mobileNumber,
    "otp": "123456",
    "os": "android",
    "deviceId": "1234567891",
    "osVersion": "10",
    "manufacturer": "samsung"
})
export default function () {
    const sendOtpResponse = http.post(`${baseUrl}/users/v1/public/send-otp`, sentPayload, {headers});
    check(sendOtpResponse, {
        'otp sent': (res) => {return res.status === 201 }
    });
    check(sendOtpResponse, {
        'otp sent Response time is less than 300ms': (res) => {return res.timings.receiving < 300}
    });
    const verifyOtp = http.post(`${baseUrl}/users/v1/public/verify-otp`,verifyPayload, {headers});
    check(verifyOtp, {
        'otp verified': (res) => { 
            // console.log(res.status)
            XAccessToken = res.headers['X-Access-Token'];
            headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
            return res.status === 201}
    });
    check(verifyOtp, {
        'verify otp Response time is less than 300ms': (res) => {
            return res.timings.receiving < 300}
    });


    const logoutResponse = http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
    check(logoutResponse, {
        'Logout endpoint status is 201': (res) => {return res.status === 201}
    });
    sleep(1);
}
