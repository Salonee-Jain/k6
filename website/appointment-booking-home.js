// import http from "k6/http";
// import { sleep, check } from "k6";
// import {
//     generateRandomMobileNumber,
//     addDayToDate,
//     generateRandomIndex,
// } from "../helper.js";

// export let options = {
//     vus: 100,
//     iterations: 100,
//     duration: "5m",
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
// const City = "bengaluru";
// const mode = "Home Visit";
// let selectSlot
// let expertIds;
// let matchingSlot;
// let XAccessToken;
// let Address = "";
// let pincode= "560038";
// const mobileNumber =  generateRandomMobileNumber();
// let dt = "2023-09-10";
// let fromTimeToCheck;
// let toTimeToCheck;

// async function appointmentHome(){
//     const sentPayload = JSON.stringify({
//         mobile: mobileNumber,
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
//     const verifyOtp = await http.post(
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
//     const previousAppointmentsResponse = await http.get(
//         `${baseUrl}/appointment/v1/customer/previous-appointments`,
//         { headers }
//     );
//     check(previousAppointmentsResponse, {
//         "previous appointments endpoint status is 200": (res) => {
//             return res.status === 200;
//         },
//     });
  
//     //----------------------------------------------------------------
//     const allAppointmentsResponse = await http.get(
//         `${baseUrl}/appointment/v1/customer/appointments`,
//         { headers }
//     );
//     check(previousAppointmentsResponse, {
//         "all appointments endpoint status is 200": (res) => {
//             return res.status === 200;
//         },
//     });
  

//     //----------------------------------------------------------------

//     const allAddressesResponse = await http.get(
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

//     const studioCityResponse = await http.get(
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
//         pincode: pincode,
//     });
//     const checkExpertAvailabilityResponse = await http.post(
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

//         availableExpertsResponse = await http.post(
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
//             // console.log(matchingSlot)
//             let randomIndex = Math.floor(Math.random() * matchingSlot.length);
//             selectSlot = matchingSlot[randomIndex]
//             expertId = selectSlot.expertIds[Math.floor(Math.random() * selectSlot.expertIds.length)]
//             // console.log(selectSlot)
//             dt = selectSlot.dt;
//             fromTimeToCheck = selectSlot.fromTime;
//             toTimeToCheck = selectSlot.toTime
//             break;
//         }
//     }


//         check(availableExpertsResponse, {
//             "check available expert endpoint status is 201": (res) => {
//                 return res.status === 201;
//             },
//         });
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
//         customerAddress: Address.trim().length>0 ? Address: "Sample Address",
//         appointmentCity: City,
//         studioId: studioId,
//         homeVisitPincode: pincode
//     });
//     // console.log(blockAppointmentPayload)
 
//     blockAppointmentResponse = await http.post(
//         `${baseUrl}/appointment/v1/customer/block`,
//         blockAppointmentPayload,
//         { headers }
//     );
   
//     // if (blockAppointmentResponse.status === 400) {
//     //     const currentSession = getSessionFromTime(fromTimeToCheck);

//     //     if (currentSession === "Morning") {
//     //         sessionToCheck = "Afternoon";
//     //         fromTimeToCheck = "01:00 PM";
//     //     } else if (currentSession === "Afternoon") {
//     //         sessionToCheck = "Evening";
//     //         fromTimeToCheck = "05:00 PM";
//     //     } else {
//     //         dt = addDayToDate(dt, 1);
//     //     }
//     // }
 


//     check(blockAppointmentResponse, {
//         "Block Appointment endpoint status is 201": (res) => {
//             // console.log(res.json());
//             appointmentId = res.json().appointmentId;
//             // console.log('appointmentId',appointmentId);
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

//     const userProfileResponse = await http.patch(
//         `${baseUrl}/users/v1/profile`,
//         userProfilePayload,
//         { headers }
//     );

//     check(userProfileResponse, {
//         "User Profile endpoint status is 200": (res) => {
//             // console.log(res.status);
//             return res.status === 200;
//         },
//     });



// //     // const releaseAppointmentResponse = await http.post(`${baseUrl}/appointment/v1/customer/release/${appointmentId}`, { headers });

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
//         "customerAddress": Address.trim().length>0 ? Address: "Sample Address",
//         "appointmentCity": City, 
//         "homeVisitPincode": pincode
//     });

//     const scheduleAppointmentResponse = await http.post(`${baseUrl}/appointment/v1/customer/schedule`, scheduleAppointmentPayload, { headers });

//     check(scheduleAppointmentResponse, {
//         'Schedule Appointment endpoint status is 201': (res) => {
//             // console.log(res.body);
//             // console.log(res.status);
//             return res.status === 201;
//         },
//     });

//     //------------------------------------------------------------------------------
//     const logoutResponse = await http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
//     check(logoutResponse, {
//         'Logout endpoint status is 201': (res) => {return res.status === 201}
//     });
//     sleep(1);
// }

// export default function () {
//     appointmentHome();
// }