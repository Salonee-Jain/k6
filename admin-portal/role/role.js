import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex, extractCityStateAndPincode, convertDateFormat, getCurrentMonth } from "../../helper.js";
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

export let options = {
    vus: 10,
    iterations: 10,
    duration: "1s",
    // rps: 100,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};
const baseUrl = "http://localhost";
let headers = { "Content-Type": "application/json" };
let XAccessToken;
let roleId;


export default function () {
    loginFlow();
    roleFlow();
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


function roleFlow(){
    const postRolePayload = {
        "name": "Test Role",
        "enabled": 1,
        "scopes": [
            "adminPortal.customerManagement.read",
            "adminPortal.cacheManagement.read"
        ]
    };

    const postResponse = http.post(`${baseUrl}/master/v1/roles`, JSON.stringify(postRolePayload), { headers });
    if(postResponse.status === 201){
        roleId = postResponse.json().roleId;
    }
    console.log(roleId)
    check(postResponse, { 'POST Role Status is 201': (r) => r.status === 201 });

   

    const getRolesResponse = http.get(`${baseUrl}/master/v1/roles?offset=0&limit=10`, { headers });
    check(getRolesResponse, { 'GET Roles Status is 200': (r) => r.status === 200 });

  
    const patchRolePayload = {
        "name": "Test Role",
        "enabled": 1,
        "isProtected": false,
        "isExpert": false,
        "scopes": [
            "adminPortal.customerManagement.read",
            "adminPortal.cacheManagement.read",
            "adminPortal.customerManagement.write",
            "adminPortal.customerManagement.delete",
            "adminPortal.cacheManagement.delete",
            "adminPortal.cacheManagement.write"
        ]
    };

    const patchResponse = http.patch(`${baseUrl}/master/v1/roles?roleId=${roleId}`, JSON.stringify(patchRolePayload), { headers });
    check(patchResponse, { 'PATCH Role Status is 200': (r) => r.status === 200 });

  
    const deleteResponse = http.del(`${baseUrl}/master/v1/roles?roleId=${roleId}`, JSON.stringify({}), { headers });
    check(deleteResponse, { 'DELETE Role Status is 200': (r) => r.status === 20 });
}


