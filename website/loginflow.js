import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomMobileNumber } from '../helper.js'

const totalIterations = 10000;
export let options = {
     vus: 10000, // Number of virtual users
    duration: '5m',
    iterations: 10000,
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
        'otp sent': (res) => {
            // console.log(res.body);
            return res.status === 201 }
    });
    
    const verifyOtp = http.post(`${baseUrl}/users/v1/public/verify-otp`,verifyPayload, {headers});
    if(verifyOtp.status === 201){
        XAccessToken = verifyOtp.headers['X-Access-Token'];
        headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
    }
    check(verifyOtp, {
        'otp verified': (res) => { 
            // console.log(res.body)
            return res.status === 201
        }
    });
   


    const logoutResponse = http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
    check(logoutResponse, {
        'Logout endpoint status is 201': (res) => {return res.status === 201}
    });
    sleep(1);
}
