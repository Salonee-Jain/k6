import http from 'k6/http';
import { sleep, check, group } from 'k6';
import { generateRandomIndex } from '../helper.js';

export let options = {
    vus: 1,
    iterations: 1,
    duration: '10s',
    // rps: 100,
    thresholds: {
        'http_req_receiving': ['p(95)<300']
    }
};
const baseUrl = 'http://localhost';
let headers = { 'Content-Type': 'application/json' };
let downloadDocument;
let downloadToken;
const sentPayload = JSON.stringify({
    mobile: '6362387858'
})

let XAccessToken;
const verifyPayload = JSON.stringify({
    "mobile": '6362387858',
    "otp": "123456",
    "os": "android",
    "deviceId": "1234567891",
    "osVersion": "10",
    "manufacturer": "samsung"
})
const fileData = open('./sign.jpeg', 'b');

export default function () {


    group('Send and Verify OTP', function () {
        // Send OTP request
        const sendOtpResponse = http.post(`${baseUrl}:3002/users/v1/public/send-otp`, sentPayload, { headers });
        check(sendOtpResponse, {
            'OTP Sent - Status is 201': (res) => res.status === 201,
        });
        const verifyOtp = http.post(`${baseUrl}:3002/users/v1/public/verify-otp`, verifyPayload, { headers });
        if (verifyOtp.status === 201) {
            XAccessToken = verifyOtp.headers['X-Access-Token'];
            headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
        }
        check(verifyOtp, {
            'OTP Verified - Status is 200': (res) => res.status === 201,
        });

        let mobileNumberToChange = '8362387858'
        let sendChangeMobileOtpResponse
        while (true) {
            sendChangeMobileOtpResponse = http.post(`${baseUrl}:3002/users/v1/profile/send-change-mobile-otp`, JSON.stringify({
                "mobileNumber": mobileNumberToChange
            }), { headers });
            if (sendChangeMobileOtpResponse.status === 400) {
                mobileNumberToChange = '6362387858';
                continue;
            }else if (sendChangeMobileOtpResponse.status === 201){
                break;
            }
        }
        check(sendChangeMobileOtpResponse, {
            'Change Mobile OTP Sent - Status is 201': (res) => res.status === 201,
        });

        const verifyChangeMobileOtpResponse = http.post(`${baseUrl}:3002/users/v1/profile/verify-change-mobile-otp`, 
        JSON.stringify({
            "mobileNumber":  mobileNumberToChange,
            "otp": "123456"
          }), 
        { headers });
        console.log(verifyChangeMobileOtpResponse.body)
        check(verifyChangeMobileOtpResponse, {
            'Verify Change Mobile OTP - Status is 201': (res) => res.status === 201,
         });


    });
}