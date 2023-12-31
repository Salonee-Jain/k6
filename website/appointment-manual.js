import http from "k6/http";
import { sleep, check } from "k6";
import {
  getFormattedCurrentDate,
  generateRandomMobileNumber,
  addDayToDate,
  generateRandomIndex,
} from "../helper.js";

export let options = {
  vus: 10,
  iterations: 10,
  duration: "30s",
  // rps: 100,
  thresholds: {
    http_req_receiving: ["p(95)<300"],
  },
};

const baseUrl = "https://antara-dev.in";
let headers = { "Content-Type": "application/json" };
let customerId;
let expertId;
let studioId;
let appointmentId;
const cityArray = ["new%20delhi", "bengaluru", "gurgaon"];
const modeArray = ["Home Visit", "Online", "Studio Visit"];
const City = cityArray[generateRandomIndex(cityArray.length - 1)];
const mode = modeArray[generateRandomIndex(modeArray.length - 1)];
let selectSlot;
let expertIds;
let matchingSlot;
let XAccessToken;
let Address = "";

let dt = getFormattedCurrentDate();
let fromTimeToCheck;
let toTimeToCheck;
console.log(City, mode);
const mobileNumber = generateRandomMobileNumber();






export default async function () {
  await loginFlow();
  await appointmentOnline();
  await logoutFlow();
}
async function appointmentOnline() {
  //----------------------------------------------------------------
  const previousAppointmentsResponse = await http.get(
    `${baseUrl}/appointment/v1/customer/previous-appointments`,
    { headers }
  );
  if(previousAppointmentsResponse.status >= 400){
    console.log('previousAppointmentsResponse',previousAppointmentsResponse.body)
  }
  check(previousAppointmentsResponse, {
    "previous appointments endpoint status is 200": (res) => {
      return res.status === 200;
    },
  });

  //----------------------------------------------------------------
  const allAppointmentsResponse = await http.get(
    `${baseUrl}/appointment/v1/customer/appointments`,
    { headers }
  );
  check(allAppointmentsResponse, {
    "all appointments endpoint status is 200": (res) => {
      return res.status === 200;
    },
  });

  //----------------------------------------------------------------

  const allAddressesResponse = await http.get(
    `${baseUrl}/users/v1/profile/all-addresses`,
    { headers }
  );
  if (allAddressesResponse.json().length > 0) {
    let index = generateRandomIndex(allAddressesResponse.json().length - 1);
    Address = res.json()[index].address;
  }
  check(allAddressesResponse, {
    "all addresses endpoint status is 200": (res) => {
      return res.status === 200;
    },
  });

  //----------------------------------------------------------------

  const studioCityResponse = await http.get(
    `${baseUrl}/master/v1/studio/city/${City}`,
    { headers }
  );

  if (studioCityResponse.json().length > 0) {
    let index = generateRandomIndex(studioCityResponse.json().length - 1);
    studioId = studioCityResponse.json()[index].studioId;
  }
  check(studioCityResponse, {
    "studio city endpoint status is 200": (res) => {
      return res.status === 200;
    },
  });

  //----------------------------------------------------------------

  const checkExpertAvailabilityPayload = JSON.stringify({
    conditionName: "Knee Pain",
    appointmentMode: mode,
    appointmentCity: City,
  });
  const checkExpertAvailabilityResponse = await http.post(
    `${baseUrl}/users/v1/expert-management/check-expert-availability`,
    checkExpertAvailabilityPayload,
    { headers }
  );
  check(checkExpertAvailabilityResponse, {
    "check expert availability endpoint status is 201": (res) => {
      expertIds = res.json();
      return res.status === 201;
    },
  });

  //----------------------------------------------------------------

  let availableExpertsResponse;
  let blockAppointmentResponse;
  async function checkAvailableExpertsResponsefunc() {
    while (true) {
      const availableExpertsPayload = JSON.stringify({
        expertIds: expertIds,
        mode: mode,
        dt: dt,
      });

      availableExpertsResponse = await http.post(
        `${baseUrl}/appointment/v1/customer/slots/available-experts`,
        availableExpertsPayload,
        { headers }
      );


      if (Object.keys(availableExpertsResponse.json()).length === 0) {
        dt = addDayToDate(dt, 1);
        continue;
      } else {

        let dateKey = Object.keys(availableExpertsResponse.json())[0];

        matchingSlot = availableExpertsResponse.json()[dateKey];
        if (matchingSlot.length == 0) {
          dt = addDayToDate(dt, 1);
          continue;
        }

        for (let i = 0; i < matchingSlot.length; i++) {
          selectSlot = matchingSlot[i];
          if (selectSlot.available) {
            break;
          } else {
            continue;
          }
        }
        if (!selectSlot.available) {
          dt = addDayToDate(dt, 1);
          continue;
        }

        if (selectSlot.expertIds.length > 0) {
          expertId =
            selectSlot.expertIds[
            generateRandomIndex(selectSlot.expertIds.length - 1)
            ];
          // console.log('selected slot ------------', selectSlot)
          dt = selectSlot.dt;
          fromTimeToCheck = selectSlot.fromTime;
          toTimeToCheck = selectSlot.toTime;
          break;
        } else {
          dt = addDayToDate(dt, 1);
          continue;
        }
      }
    }
  }
  await checkAvailableExpertsResponsefunc()
  check(availableExpertsResponse, {
    "check Available experts slots endpoint status is 201": (res) => {
      expertIds = res.json();
      return res.status === 201;
    },
  })
  // ----------------------------------------------------------------
  await blockAppointmentfunc();

  async function blockAppointmentfunc() {
    const blockAppointmentPayload = JSON.stringify({
      expertId: expertId,
      customerId: customerId,
      appointmentType: "Expert Counselling",
      appointmentMode: mode,
      dt: dt,
      fromDt: `${dt} ${fromTimeToCheck}`,
      toDt: `${dt} ${toTimeToCheck}`,
      source: "website",
      customerAddress: Address.trim().length > 0 ? Address : "Random Address",
      appointmentCity: City,
      studioId: mode == 'Studio Visit' ? studioId : undefined,
    });

    blockAppointmentResponse = await http.post(
      `${baseUrl}/appointment/v1/customer/block`,
      blockAppointmentPayload,
      { headers }
    );
  
    if (blockAppointmentResponse.status == 400) {
      await checkAvailableExpertsResponsefunc();
      await blockAppointmentfunc();
    }

    if (blockAppointmentResponse.status === 201) {
      appointmentId = blockAppointmentResponse.json().appointmentId;
     
      return
    }
  }
  check(blockAppointmentResponse, {
    "Block Appointment endpoint status is 201": (res) => {
      return res.status === 201;
    },
  });




  const userProfilePayload = JSON.stringify({
    age: 41,
    gender: null,
    email: null,
    name: `RandomName${mobileNumber}`,
  });

  //----------------------------------------------------------------

  const userProfileResponse = await http.patch(
    `${baseUrl}/users/v1/profile`,
    userProfilePayload,
    { headers }
  );

  check(userProfileResponse, {
    "User Profile endpoint status is 200": (res) => {
      return res.status === 200;
    },
  });

  //     // const releaseAppointmentResponse = await http.post(`${baseUrl}/appointment/v1/customer/release/${appointmentId}`, { headers });

  //     // check(releaseAppointmentResponse, {
  //     //     'Release Appointment endpoint status is 201': (res) => {
  //     //         console.log(res.body)
  //     //         return res.status === 201;
  //     //     },
  //     // });

  //     // check(releaseAppointmentResponse, {
  //     //     'Release Appointment Response time is less than 300ms': (res) => {
  //     //         return res.timings.receiving < 300;
  //     //     },
  //     // });
  //     //------------------------------------------------------------------------------

  //     //----------------------------------------------------------------
  const scheduleAppointmentPayload = JSON.stringify({
    expertId: expertId,
    customerId: customerId,
    appointmentType: "Expert Counselling",
    appointmentMode: mode,
    appointmentId: appointmentId,
    dt: dt,
    fromDt: `${dt} ${fromTimeToCheck}`,
    toDt: `${dt} ${toTimeToCheck}`,
    source: "website",
    customerAddress: Address.trim().length > 0 ? Address : "Random Address",
    appointmentCity: City,
    studioId: mode == 'Studio Visit' ? studioId : undefined,
  });

  const scheduleAppointmentResponse = await http.post(
    `${baseUrl}/appointment/v1/customer/schedule`,
    scheduleAppointmentPayload,
    { headers }
  );

  if(scheduleAppointmentResponse.status >= 400){
      await checkAvailableExpertsResponsefunc();
      await blockAppointmentfunc();
  }
  if(scheduleAppointmentResponse.status >= 400){
    console.log('schedule',scheduleAppointmentResponse.json())
  }
  // console.log(scheduleAppointmentResponse.json().appointmentId)
  appointmentId = scheduleAppointmentResponse.json().appointmentId;
  check(scheduleAppointmentResponse, {
    "Schedule Appointment endpoint status is 201": (res) => {
      return res.status === 201;
    },
  });

  console.log('before request',scheduleAppointmentResponse.json().appointmentId);
  const cancelAppointmentResponse = await http.post(
    
    `${baseUrl}/appointment/v1/customer/cancel/${scheduleAppointmentResponse.json().appointmentId}`,
    JSON.stringify({}),
    { headers }
  );
  if(cancelAppointmentResponse.status >= 400){
    console.log('cancel',cancelAppointmentResponse.body)
  }

  check(cancelAppointmentResponse, {
    "Cancel Appointment endpoint status is 200": (res) => {
      return res.status === 201;
    },
  });

  //------------------------------------------------------------------------------
}

async function loginFlow() {
  const sentPayload = JSON.stringify({
    mobile: mobileNumber,
  });
  const sendOtpResponse = await http.post(
    `${baseUrl}/users/v1/public/send-otp`,
    sentPayload,
    { headers }
  );
  check(sendOtpResponse, {
    "otp sent": (res) => {
      return res.status === 201;
    },
  });

  const verifyPayload = JSON.stringify({
    mobile: mobileNumber,
    otp: "123456",
    os: "android",
    deviceId: "1234567891",
    osVersion: "10",
    manufacturer: "samsung",
  });
  const verifyOtp = await http.post(
    `${baseUrl}/users/v1/public/verify-otp`,
    verifyPayload,
    { headers, responseType: "text" }
  );
  if (
    (verifyOtp.json() !== undefined) | null &&
    Object.keys(verifyOtp.json()).length > 0
  ) {
    customerId = verifyOtp.json().user.customerId;
    XAccessToken = verifyOtp.headers["X-Access-Token"];
    headers = {
      "Content-Type": "application/json",
      "X-Access-Token": XAccessToken,
    };
  }
  check(verifyOtp, {
    "otp verified": (res) => {
      return res.status === 201;
    },
  });
}

async function logoutFlow() {
  const logoutResponse = await http.post(
    `${baseUrl}/users/v1/public/logout`,
    JSON.stringify({}),
    { headers }
  );
  check(logoutResponse, {
    "Logout endpoint status is 201": (res) => {
      return res.status === 201;
    },
  });
  sleep(1);
}

