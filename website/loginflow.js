import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomMobileNumber } from '../helper.js'


export let options = {
     vus: 1000, 
    iterations: 1000,
     thresholds: {
        'http_req_receiving': ['p(95)<300']
    }
};
const mobileNumber =  generateRandomMobileNumber();
const baseUrl = 'https://antara-dev.in';
let headers = { 'Content-Type': 'application/json' };

let  XAccessToken;


export default function () {
    const sentPayload = JSON.stringify({
        mobile: mobileNumber
    })

    const sendOtpResponse = http.post(`${baseUrl}/users/v1/public/send-otp`, sentPayload, {headers});
    check(sendOtpResponse, {
        'otp sent': (res) => {
            return res.status === 201 }
    });

    console.log(sendOtpResponse.body)
    
    const verifyPayload = JSON.stringify({
        "mobile":mobileNumber,
        "otp": "123456",
        "os": "android",
        "deviceId": "1234567891",
        "osVersion": "10",
        "manufacturer": "samsung"
    })
    const verifyOtp = http.post(`${baseUrl}/users/v1/public/verify-otp`,verifyPayload, {headers});
    if(verifyOtp.status === 201){
        XAccessToken = verifyOtp.headers['X-Access-Token'];
        headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
    }
    console.log(verifyOtp.body);
    check(verifyOtp, {
        'otp verified': (res) => { 
            return res.status === 201
        }
    });
   


    const logoutResponse = http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
    check(logoutResponse, {
        'Logout endpoint status is 201': (res) => {return res.status === 201}
    });
    console.log(logoutResponse.body);
    sleep(1);
}
