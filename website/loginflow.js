import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomMobileNumber } from '../helper.js'


export let options = {
    stages: [
        { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
        { duration: '4m', target: 100 }, // Stay at 100 users for 4 minutes
        { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
        { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
        { duration: '3m', target: 400 }, // Ramp up to 400 users over 3 minutes
        { duration: '5m', target: 400 }, // Stay at 400 users for 5 minutes
        { duration: '3m', target: 800 }, // Ramp up to 800 users over 3 minutes
        { duration: '5m', target: 800 }, // Stay at 800 users for 5 minutes
        { duration: '2m', target: 1000 }, // Ramp up to 1,000 users over 2 minutes
        { duration: '2m', target: 1000 }, // Stay at 1,000 users for 2 minutes
        { duration: '2m', target: 500 }, // Ramp down to 500 users over 2 minutes
        { duration: '3m', target: 500 }, // Stay at 500 users for 3 minutes
        { duration: '1m', target: 0 }, // Ramp down to 0 users over 1 minute
    ],
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
