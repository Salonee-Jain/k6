import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex, generateRandomMobileNumber } from "../../helper.js";
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

export let options = {
    vus: 4,
    iterations: 4,
    duration: "1m",
    // rps: 100,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};
const baseUrl = "http://localhost";
let headers = { "Content-Type": "application/json" };
let XAccessToken;
let stateId;
let searchName = "Mandanna";
let customerId;
let mode = 'Online'
let conditionIds;
let search = 'or';
let pincode;
let city;
let state;
let placesId;
let Address;
let mobileNumber;
let addressId;
let customerName;
let expertId
let expertName;
let slot;
let appointmentId;
let studioId;
let email;
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
    loginFlow();
    const rolesResponse = http.get(`${baseUrl}/master/v1/roles?offset=0&limit=100`, { headers });
    if (rolesResponse.status === 200) {
        roleId = rolesResponse.json().data.filter(r => r.name == 'Expert')[0].roleId
    } else {
        roleId = '82579c04-6229-4862-805a-fcde6926e48f'
    }
    check(rolesResponse, {
        "Roles Status is 200": (r) => r.status === 200,
    });
    const expertCreationPayload = JSON.stringify({
        name: 'Test experts',
        appointmentModes: ['Online'],
        employeeId: '09',
        email: 'f@gmails.com',
        bioData: 'ff',
        consultationFee: 1000,
        yearsOfExperience: 2,
        roleId: '82579c04-6229-4862-805a-fcde6926e48f',
        conditionIds: [
            '97bf065d-dc27-42d0-8abc-9ca552a653b6',
        ],
        mobile: generateRandomMobileNumber(),
    });

    const expertCreationResponse = http.post(`${baseUrl}/users/v1/user-management`, expertCreationPayload, { headers });
    if (expertCreationResponse.json() !== undefined) {
        expertId = expertCreationResponse.json().userId;
    } 
    console.log(expertCreationResponse.body)
    check(expertCreationResponse, {
        'Expert create status is 201 Created': (r) => r.status === 201,
    });


    const studioResponse = http.get(`${baseUrl}/master/v1/studio?offset=0&limit=100`, { headers });
    if (studioResponse.json().data.length > 0) {
        let index = generateRandomIndex(studioResponse.json().data.length - 1)
        studioId = studioResponse.json().data[index].studioId;

    }
    check(studioResponse, {
        "Studio Status is 200": (r) => r.status === 200,
    });
    console.log(expertId)
    return {expertId, studioId, headers}
}


export default function (data) {
   const {expertId, studioId, headers} = data;
   const patchPayload = JSON.stringify({
    name: expertName,
});

const patchResponse = http.patch(`${baseUrl}/users/v1/user-management/${expertId}`, patchPayload, { headers });
check(patchResponse, {
    "Patch Expert Management Status is 200": (r) => r.status === 200,
});

const deleteResponse = http.del(`${baseUrl}/users/v1/user-management/${expertId}`, JSON.stringify({}), { headers });
console.log(deleteResponse.body)
check(deleteResponse, {
    "Delete Expert Management Status is 200": (r) => r.status === 200,
});
}