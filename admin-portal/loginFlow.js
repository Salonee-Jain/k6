import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomMobileNumber } from '../helper.js'


export let options = {
    vus: 1, 
    iterations: 1,
    duration: '1s',
    // rps: 100,
     thresholds: {
        'http_req_receiving': ['p(95)<300']
    }
};
const mobileNumber =  generateRandomMobileNumber();
const baseUrl = 'http://localhost:3002';
let headers = { 'Content-Type': 'application/json' };
let  XAccessToken;

export default function () {
    let verifyPasswordPayload = JSON.stringify({
          email: 'varun.v@gida.io',
          password: 'Smart@1212',
          os: 'web',
          deviceId: 'web',
          osVersion: 'web',
          manufacturer: 'web',
        })
    const verifyPasswordResponse = http.post(`${baseUrl}/users/v1/public/verify-password`, verifyPasswordPayload, {headers});
    check(verifyPasswordResponse, {
        'Verify Password status is 201': (res) => {
            return res.status === 201 }
    });
    sleep(1);

    const verifyOtpPayload = JSON.stringify({
        email: 'varun.v@gida.io',
        otp: '123456',
        os: 'web',
        deviceId: 'web',
        osVersion: 'web',
        manufacturer: 'web',
      })
    
    const verifyOtp = http.post(`${baseUrl}/users/v1/public/verify-otp`,verifyOtpPayload, {headers});
    if(verifyOtp.status === 201){
        XAccessToken = verifyOtp.headers['X-Access-Token'];
        headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
    }
    check(verifyOtp, {
        'Verify Otp status is 201': (res) => {
            return res.status === 201
        }
    });
    sleep(1);
   

    const logoutResponse = http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
    check(logoutResponse, {
        'Logout status is 201': (res) => {return res.status === 201}
    });
    sleep(1);
}
