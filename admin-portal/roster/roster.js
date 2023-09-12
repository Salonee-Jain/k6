import http from "k6/http";
import { sleep, check } from "k6";
import { getFormattedCurrentDate } from "../../helper.js";
export let options = {
    vus: 1,
    iterations: 1,
    duration: "1s",
    // rps: 100,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};

const baseUrl = "http://localhost";
let headers = { "Content-Type": "application/json" };
let XAccessToken;
let date = getFormattedCurrentDate();
let expertType = Expert;
let studioIds;
let expertIds;

export default function () {
    loginFlow();
    globalSettingsFlow();
    getManagerViewWithStudioAndExpertIds(studioIds, expertIds, expertType, date);
    sleep(1);
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


function globalSettingsFlow(){
    let mangerViewResponse = http.get(`${baseUrl}:3010/appointment/v1/admin-portal/manager-view?expertType=${expertType}&date=${date}`, {headers});
    console.log(mangerViewResponse.body);
    check(mangerViewResponse, {
      'GET Manager View Status is 200': (res) => res.status === 200,
    });

    
        let updateGlobalSettingPayload = JSON.stringify({
          fromTime: '10:00',
          toTime: '23:30',
          workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        });
        let updateGlobalSettingResponse = http.patch(`${baseUrl}:3010/appointment/v1/admin-portal/global-setting/Expert`, updateGlobalSettingPayload, {
            headers
        });
        check(updateGlobalSettingResponse, {
          'PATCH Global Setting Status is 200': (res) => res.status === 200,
        });
      

      
}
export function getManagerViewWithStudioAndExpertIds(studioIds, expertIds, expertType, date) {
    let url = `/appointment/v1/admin-portal/manager-view?expertType=${expertType}&date=${date}`;
  
    if (studioIds !== undefined) {
      url += `&studioIds=${studioIds}`;
    }
  
    if (expertIds !== undefined) {
      url += `&expertIds=${expertIds}`;
    }
  
    let response = http.get(url);
    
    check(response, {
      'GET Manager View with Studio and Expert IDs Status is 200': (res) => res.status === 200,
    });
  }