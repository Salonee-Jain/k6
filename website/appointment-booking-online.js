// import http from "k6/http";
// import { sleep, check } from "k6";
// import {getFormattedCurrentDate,
//     generateRandomMobileNumber,
//     addDayToDate,
//     generateRandomIndex
// } from "../helper.js";
// const totalIterations = 10;
// export let options = {
//     stages: [
//         { duration: '1s', target: 1 }, // Rasp up to 1 users over 1 sinute
//         { duration: '5s', target: 4 }, // Stay at 1 users for 5 sinutes
//         { duration: '2s', target: 5 }, // Rasp up to 5 users over 2 sinutes
//         { duration: '10s', target: 5 }, // Stay at 5 users for 10 sinutes
//         { duration: '10s', target: 10 }, // Stay at 1,0 users for 10 sinutes
//         { duration: '2s', target: 50 }, // Rasp up to 5,0 users over 2 sinutes
//         { duration: '10s', target: 1 }, 
//         { duration: '10s', target: 10 }, // Stay at 1,0 users for 10 sinutes
//         { duration: '2s', target: 5 }, // Rasp down to 5 users over 2 sinutes
//         { duration: '10s', target: 5 }, // Stay at 500 users for 10 sinutes
//         { duration: '1s', target: 0 }, // Ramp down to 0 users over 1 minute
//       ],
   
//     // rps: 100,
//     thresholds: {
//         http_req_receiving: ["p(95)<300"],
//     },
// };

// const baseUrl = "https://antara-dev.in";
// let headers = { "Content-Type": "application/json" };
// let customerId;
// let expertId;
// let studioId;
// let appointmentId;
// const City = 'bengaluru';
// const mode = 'Online';
// let selectSlot;
// let expertIds;
// let matchingSlot;
// let XAccessToken;
// let Address = '';

// let dt = getFormattedCurrentDate();
// let fromTimeToCheck;
// let toTimeToCheck;
// console.log(City, mode)
// const mobileNumber =  generateRandomMobileNumber();

// function appointmentOnline(){
//     const sentPayload = JSON.stringify({
//         mobile:mobileNumber,
//     });
//     const sendOtpResponse = http.post(
//         `${baseUrl}/users/v1/public/send-otp`,
//         sentPayload,
//         { headers }
//     );
//     check(sendOtpResponse, {
//         "otp sent": (res) => {
//             return res.status === 201;
//         },
//     });
//     //----------------------------------------------------------------
//     const verifyPayload = JSON.stringify({
//         mobile: mobileNumber,
//         otp: "123456",
//         os: "android",
//         deviceId: "1234567891",
//         osVersion: "10",
//         manufacturer: "samsung",
//     });
//     const verifyOtp = http.post(
//         `${baseUrl}/users/v1/public/verify-otp`,
//         verifyPayload,
//         { headers, responseType: "text" }
//     );
//     if (verifyOtp.json() !== undefined | null && Object.keys(verifyOtp.json()).length > 0) {
//         customerId = verifyOtp.json().user.customerId;
//         XAccessToken = verifyOtp.headers["X-Access-Token"];
//         headers = {
//             "Content-Type": "application/json",
//             "X-Access-Token": XAccessToken,
//         };
//     }
//     check(verifyOtp, {
//         "otp verified": (res) => {
//             return res.status === 201;
//         },
//     });

//     //----------------------------------------------------------------
//     const previousAppointmentsResponse = http.get(
//         `${baseUrl}/appointment/v1/customer/previous-appointments`,
//         { headers }
//     );
//     check(previousAppointmentsResponse, {
//         "previous appointments endpoint status is 200": (res) => {
//             return res.status === 200;
//         },
//     });


//     //----------------------------------------------------------------
//     const allAppointmentsResponse = http.get(
//         `${baseUrl}/appointment/v1/customer/appointments`,
//         { headers }
//     );
//     check(allAppointmentsResponse, {
//         "all appointments endpoint status is 200": (res) => {
//             return res.status === 200;
//         },
//     });
   
//     //----------------------------------------------------------------

//     const allAddressesResponse = http.get(
//         `${baseUrl}/users/v1/profile/all-addresses`,
//         { headers }
//     );
//     if(allAddressesResponse.json().length > 0) {
//         let index = generateRandomIndex(allAddressesResponse.json().length-1);
//         Address = res.json()[index].address
//     }
//     check(allAddressesResponse, {
//         "all addresses endpoint status is 200": (res) => {
//             return res.status === 200;
//         },
//     });
  

//     //----------------------------------------------------------------

//     const studioCityResponse = http.get(
//         `${baseUrl}/master/v1/studio/city/${City}`,
//         { headers }
//     );

//      if(studioCityResponse.json().length > 0) {
//         let index = generateRandomIndex(studioCityResponse.json().length-1);
//         studioId = studioCityResponse.json()[index].studioId
//     }
//     check(studioCityResponse, {
//         "studio city endpoint status is 200": (res) => {
//             return res.status === 200;
//         },
//     });
  

//     //----------------------------------------------------------------

//     const checkExpertAvailabilityPayload = JSON.stringify({
//         conditionName: "Knee Pain",
//         appointmentMode: mode,
//         appointmentCity: City,
//     });
//     const checkExpertAvailabilityResponse = http.post(
//         `${baseUrl}/users/v1/expert-management/check-expert-availability`,
//         checkExpertAvailabilityPayload,
//         { headers }
//     );
//     check(checkExpertAvailabilityResponse, {
//         "check expert availability endpoint status is 201": (res) => {
//             expertIds = res.json();
//             return res.status === 201;
//         },
//     });
   

//     //----------------------------------------------------------------

//     let availableExpertsResponse;
//     let blockAppointmentResponse;
//     while (true) {
//         const availableExpertsPayload = JSON.stringify({
//             expertIds: expertIds,
//             mode: mode,
//             dt: dt,
//         });

//         availableExpertsResponse = http.post(
//             `${baseUrl}/appointment/v1/customer/slots/available-experts`,
//             availableExpertsPayload,
//             { headers }
//         );

//         if (Object.keys(availableExpertsResponse.json()).length === 0) {
//             dt = addDayToDate(dt, 1);
//             continue;
//         } else {
//             let dateKey = Object.keys(availableExpertsResponse.json())[0];

//             matchingSlot = availableExpertsResponse.json()[dateKey];
//             if (matchingSlot.length == 0) {
//                 dt = addDayToDate(dt, 1);
//                 continue;
//             }
            
//             let index =  generateRandomIndex(matchingSlot.length - 1)
//             selectSlot = matchingSlot[index]
//             expertId = selectSlot.expertIds[generateRandomIndex(selectSlot.expertIds.length - 1)]
//             dt = selectSlot.dt;
//             fromTimeToCheck = selectSlot.fromTime;
//             toTimeToCheck = selectSlot.toTime
//             break;
//         }
//     }
//     // ----------------------------------------------------------------
   
//     const blockAppointmentPayload = JSON.stringify({
//         expertId: expertId,
//         customerId: customerId,
//         appointmentType: "Expert Counselling",
//         appointmentMode: mode,
//         dt: dt,
//         fromDt:`${dt} ${fromTimeToCheck}`,
//         toDt: `${dt} ${toTimeToCheck}`,
//         source: "website",
//         customerAddress: Address.trim().length > 0 ? Address: "Random Address",
//         appointmentCity: City,
//     });
 
//     blockAppointmentResponse = http.post(
//         `${baseUrl}/appointment/v1/customer/block`,
//         blockAppointmentPayload,
//         { headers }
//     );

//     check(blockAppointmentResponse, {
//         "Block Appointment endpoint status is 201": (res) => {
//             appointmentId = res.json().appointmentId;
//             return res.status === 201;
//         },
//     });
   
//     const userProfilePayload = JSON.stringify({
//         age: 41,
//         gender: null,
//         email: null,
//         name: "Saloni",
//     });

//     //----------------------------------------------------------------

//     const userProfileResponse = http.patch(
//         `${baseUrl}/users/v1/profile`,
//         userProfilePayload,
//         { headers }
//     );

//     check(userProfileResponse, {
//         "User Profile endpoint status is 200": (res) => {
//             return res.status === 200;
//         },
//     });



// //     // const releaseAppointmentResponse = http.post(`${baseUrl}/appointment/v1/customer/release/${appointmentId}`, { headers });

// //     // check(releaseAppointmentResponse, {
// //     //     'Release Appointment endpoint status is 201': (res) => {
// //     //         console.log(res.body)
// //     //         return res.status === 201;
// //     //     },
// //     // });

// //     // check(releaseAppointmentResponse, {
// //     //     'Release Appointment Response time is less than 300ms': (res) => {
// //     //         return res.timings.receiving < 300;
// //     //     },
// //     // });
// //     //------------------------------------------------------------------------------

// //     //----------------------------------------------------------------
//     const scheduleAppointmentPayload = JSON.stringify({
//         "expertId": expertId,
//         "customerId": customerId,
//         "appointmentType": "Expert Counselling",
//         "appointmentMode": mode,
//         "appointmentId": appointmentId,
//         "dt": dt,
//         "fromDt":`${dt} ${fromTimeToCheck}`,
//         "toDt": `${dt} ${toTimeToCheck}`,
//         "source": "website",
//         "customerAddress": Address.trim().length > 0 ? Address: "Random Address",
//         "appointmentCity": City,
//     });

//     const scheduleAppointmentResponse = http.post(`${baseUrl}/appointment/v1/customer/schedule`, scheduleAppointmentPayload, { headers });

//     check(scheduleAppointmentResponse, {
//         'Schedule Appointment endpoint status is 201': (res) => {
//             return res.status === 201;
//         },
//     });


//     //------------------------------------------------------------------------------
//     const logoutResponse = http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
//     check(logoutResponse, {
//         'Logout endpoint status is 201': (res) => {return res.status === 201}
//     });
//     sleep(1);
// }

// export default function () {
//     appointmentOnline();
// }