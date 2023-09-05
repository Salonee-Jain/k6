import http from "k6/http";
import { sleep, check } from "k6";
import {
    convertDatetime,
    addMinutesToTime,
    addDayToDate,
    getSessionFromTime,
} from "./helper.js";

export let options = {
    vus: 1,
    iterations: 1,
    duration: "1m",
    // rps: 100,
    thresholds: {
        http_req_receiving: ["p(95)<300"],
    },
};

const baseUrl = "http://localhost";
let headers = { "Content-Type": "application/json" };
let customerId;
let expertId;
let studioId;
let appointmentId;
const City = "bengaluru";
const mode = "Online";
let selectSlot
let expertIds;
let matchingSlot;
let XAccessToken;

let dt = "2023-09-04";
let fromTimeToCheck;
let toTimeToCheck;
export default function () {
    const sentPayload = JSON.stringify({
        mobile: "6362387858",
    });
    const sendOtpResponse = http.post(
        `${baseUrl}:3002/users/v1/public/send-otp`,
        sentPayload,
        { headers }
    );
    check(sendOtpResponse, {
        "otp sent": (res) => {
            console.log(res.status);
            return res.status === 201;
        },
    });
    check(sendOtpResponse, {
        "otp sent Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });
    //----------------------------------------------------------------
    const verifyPayload = JSON.stringify({
        mobile: "6362387858",
        otp: "123456",
        os: "android",
        deviceId: "1234567891",
        osVersion: "10",
        manufacturer: "samsung",
    });
    const verifyOtp = http.post(
        `${baseUrl}:3002/users/v1/public/verify-otp`,
        verifyPayload,
        { headers, responseType: "text" }
    );
    check(verifyOtp, {
        "otp verified": (res) => {
            customerId = res.json().user.customerId;
            XAccessToken = res.headers["X-Access-Token"];
            headers = {
                "Content-Type": "application/json",
                "X-Access-Token": XAccessToken,
            };
            return res.status === 201;
        },
    });
    check(verifyOtp, {
        "otp verify Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });

    //----------------------------------------------------------------
    const previousAppointmentsResponse = http.get(
        `${baseUrl}:3010/appointment/v1/customer/previous-appointments`,
        { headers }
    );
    check(previousAppointmentsResponse, {
        "previous appointments endpoint status is 200": (res) => {
            console.log(res.status);
            return res.status === 200;
        },
    });
    check(previousAppointmentsResponse, {
        "Previous Appointments Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });

    //----------------------------------------------------------------
    const allAppointmentsResponse = http.get(
        `${baseUrl}:3010/appointment/v1/customer/appointments`,
        { headers }
    );
    check(previousAppointmentsResponse, {
        "all appointments endpoint status is 200": (res) => {
            return res.status === 200;
        },
    });
    check(previousAppointmentsResponse, {
        "All Appointments Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });

    //----------------------------------------------------------------

    const allAddressesResponse = http.get(
        `${baseUrl}:3002/users/v1/profile/all-addresses`,
        { headers }
    );
    check(allAddressesResponse, {
        "all addresses endpoint status is 200": (res) => {
            return res.status === 200;
        },
    });
    check(allAddressesResponse, {
        "All Addresses Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });

    //----------------------------------------------------------------

    const studioCityResponse = http.get(
        `${baseUrl}:3004/master/v1/studio/city/${City}`,
        { headers }
    );
    check(studioCityResponse, {
        "studio city endpoint status is 200": (res) => {
            studioId = res.json()[0].studioId;
            return res.status === 200;
        },
    });
    check(studioCityResponse, {
        "Studio City Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });

    //----------------------------------------------------------------

    const checkExpertAvailabilityPayload = JSON.stringify({
        conditionName: "Knee Pain",
        appointmentMode: mode,
        appointmentCity: City,
    });
    const checkExpertAvailabilityResponse = http.post(
        `${baseUrl}:3002/users/v1/expert-management/check-expert-availability`,
        checkExpertAvailabilityPayload,
        { headers }
    );
    check(checkExpertAvailabilityResponse, {
        "check expert availability endpoint status is 201": (res) => {
            console.log(res.body);
            expertIds = res.json();
            return res.status === 201;
        },
    });
    check(checkExpertAvailabilityResponse, {
        "Check Expert Availability Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });

    //----------------------------------------------------------------

    let availableExpertsResponse;
    let blockAppointmentResponse;
    while (true) {
        const availableExpertsPayload = JSON.stringify({
            expertIds: expertIds,
            mode: mode,
            dt: dt,
        });

        availableExpertsResponse = http.post(
            `${baseUrl}:3010/appointment/v1/customer/slots/available-experts`,
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
            // console.log(matchingSlot)
            let randomIndex = Math.floor(Math.random() * matchingSlot.length);
            selectSlot = matchingSlot[randomIndex]
            expertId = selectSlot.expertIds[Math.floor(Math.random() * selectSlot.expertIds.length)]
            console.log(selectSlot)
            dt = selectSlot.dt;
            fromTimeToCheck = selectSlot.fromTime;
            toTimeToCheck = selectSlot.toTime
            break;
        }
    }
    // ----------------------------------------------------------------
   
    const blockAppointmentPayload = JSON.stringify({
        expertId: expertId,
        customerId: customerId,
        appointmentType: "Expert Counselling",
        appointmentMode: mode,
        dt: dt,
        fromDt:`${dt} ${fromTimeToCheck}`,
        toDt: `${dt} ${toTimeToCheck}`,
        source: "website",
        customerAddress: " ",
        appointmentCity: City,
        studioId: studioId
    });
    console.log(blockAppointmentPayload)
 
    blockAppointmentResponse = http.post(
        `${baseUrl}:3010/appointment/v1/customer/block`,
        blockAppointmentPayload,
        { headers }
    );
   
    // if (blockAppointmentResponse.status === 400) {
    //     const currentSession = getSessionFromTime(fromTimeToCheck);

    //     if (currentSession === "Morning") {
    //         sessionToCheck = "Afternoon";
    //         fromTimeToCheck = "01:00 PM";
    //     } else if (currentSession === "Afternoon") {
    //         sessionToCheck = "Evening";
    //         fromTimeToCheck = "05:00 PM";
    //     } else {
    //         dt = addDayToDate(dt, 1);
    //     }
    // }
 
        // check(availableExpertsResponse, {
        //     "check available expert endpoint status is 201": (res) => {
        //         return res.status === 201;
        //     },
        // });


    check(blockAppointmentResponse, {
        "Block Appointment endpoint status is 201": (res) => {
            console.log(res.json());
            appointmentId = res.json().appointmentId;
            console.log('appointmentId',appointmentId);
            return res.status === 201;
        },
    });

    // check(blockAppointmentResponse, {
    //     "Block Appointment Response time is less than 300ms": (res) => {
    //         return res.timings.receiving < 300;
    //     },
    // });
    const userProfilePayload = JSON.stringify({
        age: 41,
        gender: null,
        email: null,
        name: "Saloni",
    });

    //----------------------------------------------------------------

    const userProfileResponse = http.patch(
        `${baseUrl}:3002/users/v1/profile`,
        userProfilePayload,
        { headers }
    );

    check(userProfileResponse, {
        "User Profile endpoint status is 200": (res) => {
            console.log(res.status);
            return res.status === 200;
        },
    });

    check(userProfileResponse, {
        "User Profile Response time is less than 300ms": (res) => {
            return res.timings.receiving < 300;
        },
    });


//     // const releaseAppointmentResponse = http.post(`${baseUrl}:3010/appointment/v1/customer/release/${appointmentId}`, { headers });

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
        "expertId": expertId,
        "customerId": customerId,
        "appointmentType": "Expert Counselling",
        "appointmentMode": mode,
        "appointmentId": appointmentId,
        "dt": dt,
        "fromDt": convertDatetime(`${dt} ${fromTimeToCheck}`),
        "toDt": convertDatetime(`${dt} ${addMinutesToTime(fromTimeToCheck, 30)}`),
        "source": "website",
        "customerAddress": " ",
        "appointmentCity": City, 
        studioId: stdu
    });

    const scheduleAppointmentResponse = http.post(`${baseUrl}:3010/appointment/v1/customer/schedule`, scheduleAppointmentPayload, { headers });

    check(scheduleAppointmentResponse, {
        'Schedule Appointment endpoint status is 201': (res) => {
            console.log(res.body);
            console.log(res.status);
            return res.status === 201;
        },
    });

    check(scheduleAppointmentResponse, {
        'Schedule Appointment Response time is less than 300ms': (res) => {
            return res.timings.receiving < 300;
        },
    });

    //------------------------------------------------------------------------------
    const logoutResponse = http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
    check(logoutResponse, {
        'Logout endpoint status is 201': (res) => {return res.status === 201}
    });
    sleep(1);
}