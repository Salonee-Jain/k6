import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex, extractCityStateAndPincode, convertDateFormat, getCurrentMonth } from "../../helper.js";
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import loginflow from "../../website/loginflow.js";

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

export function setup() {
    loginFlow()
    const getRolesResponse = http.get(`${baseUrl}/master/v1/roles?offset=0&limit=20`, { headers });
    if (getRolesResponse.status === 200) {
        roleId = getRolesResponse.json().data.filter(r => r.name == 'Customer')[0].roleId
    } else {
        roleId = 'fb1784e1-42cb-46f0-abab-20ab5f92a3b0'
    }
    check(getRolesResponse, { 'GET Roles Status is 200': (r) => r.status === 200 });
    const postUserPayload = {
        "name": "New User",
        "email": "nw@gmail.com",
        "password": "Smart@1212",
        "confirmPassword": "Smart@1212",
        "roleId": roleId,
        "mobile": "6789876544",
        "employeeId": "12345"
    };
    const postUserResponse = http.post(`${baseUrl}/users/v1/user-management`, JSON.stringify(postUserPayload), { headers });
    console.log(postUserResponse.body)
    check(postUserResponse, { 'POST User Status is 201': (r) => r.status === 201 });
    const userId = postUserResponse.json().userId;
    sleep(1);
    return {userId, headers};


}

export default function (data) {
  
    const { userId ,headers} = data;
    console.log(userId)
    const getUserResponse = http.get(`${baseUrl}/users/v1/user-management?offset=0&limit=1`, { headers });
    check(getUserResponse, { 'GET User Status is 200': (r) => r.status === 200 });

    const userName = "Updated User Name";
    const patchUserPayload = {
        "name": userName
    };
    const patchUserResponse = http.patch(`${baseUrl}/users/v1/user-management/${userId}`, JSON.stringify(patchUserPayload), { headers });
    check(patchUserResponse, { 'PATCH User Status is 200': (r) => r.status === 200 });

    const deleteUserResponse = http.del(`${baseUrl}/users/v1/user-management/${userId}`, JSON.stringify({}), { headers });
    check(deleteUserResponse, { 'DELETE User Status is 200': (r) => r.status === 200 });
}


