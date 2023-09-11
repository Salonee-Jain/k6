import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex, generateRandomMobileNumber, getCurrentMonth, convertDateFormat } from "../../helper.js";

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
let stateId;
let search = "organ";
let customerId;
let RescheduleMode = ["Online", "Studio Visit", "Home Visit"][generateRandomIndex(2)];
let conditionIds;
let pincode;
let studioId;
let expertId;
let slot;
let Address;

export default function () {
    loginFlow();
    appointmentFlow();
}

let appointmentId;

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
            //console.log(res.body)
            return res.status === 201;
        },
    });
}

function appointmentFlow() {
    let getAllExpertsResponse = http.get(
        `${baseUrl}/users/v1/user-management?limit=10&isExpert=true`,
        { headers }
    );

    check(getAllExpertsResponse, {
        "User Management status is 200": (r) => {
            return r.status === 200;
        },
    });

    // let studioResponse = http.get(
    //     `${baseUrl}/master/v1/studio?limit=60`, { headers }
    // );

    // check(studioResponse, {
    //     'Studio status is 200': (r) => { return r.status === 200 },
    // });

    function getAllAppointments(
        offset = 0,
        limit = 10,
        status = "",
        fromDt = "",
        toDt = ""
    ) {
        const queryParams = {
            offset,
            limit,
            status,
            sortBy: "date",
            reverse: true,
            fromDt,
            toDt,
        };

        const url =
            `${baseUrl}:3010/appointment/v1/admin-management/all-appointments?` +
            Object.entries(queryParams)
                .filter(([_, value]) => value !== "") // Exclude empty parameters
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join("&");

        const response = http.get(url, { headers });
        return response;
    }

    // let allAppointmentsResponse1 = getAllAppointments();
    // check(allAppointmentsResponse1, {
    //     'All Appointments Variation 1 status is 200': (r) => r.status === 200,
    // });

    // let allAppointmentsResponse2 = getAllAppointments(0, 10, '', '2023-09-12', '2023-09-30');
    // check(allAppointmentsResponse2, {
    //     'All Appointments Variation 2 status is 200': (r) => r.status === 200,
    // });

    let ScheduledAllAppointmentsResponse = getAllAppointments(
        0,
        10,
        "Scheduled",
        "",
        ""
    );

    if (ScheduledAllAppointmentsResponse.json().data.length > 0) {
        let index = generateRandomIndex(
            ScheduledAllAppointmentsResponse.json().data.length - 1
        );
        appointmentId =
            ScheduledAllAppointmentsResponse.json().data[index].appointmentId;
        customerId = ScheduledAllAppointmentsResponse.json().data[index].customerId;
    }
    check(ScheduledAllAppointmentsResponse, {
        "All Appointments Variation 3 status is 200": (r) => r.status === 200,
    });

    let sendReminderResponse = http.post(
        `${baseUrl}:3010/appointment/v1/admin-management/reminder/${appointmentId}`,
        { headers }
    );
    console.log(sendReminderResponse.status);

    check(sendReminderResponse, {
        "Send Reminder status is 201": (r) => r.status === 201,
    });

    let cancelAppointmentResponse = http.post(
        `${baseUrl}:3010/appointment/v1/admin-management/cancel/${appointmentId}`,
        { headers }
    );

    check(cancelAppointmentResponse, {
        "Cancel Appointment status is 200": (r) => r.status === 200,
    });
    
    let rescheduleAppointment = getAllAppointments(
        0,
        10,
        "Scheduled",
        "",
        ""
    )
    if (rescheduleAppointment.json().data.length > 0) {
        let index = generateRandomIndex(
            rescheduleAppointment.json().data.length - 1
        );
        appointmentId =
        rescheduleAppointment.json().data[index].appointmentId;
        customerId = rescheduleAppointment.json().data[index].customerId;
    }

    let conditionsResponse = http.get(`${baseUrl}/master/v1/condition`, {
        headers,
    });
    if (conditionsResponse.json().data.length > 0) {
        let index = generateRandomIndex(conditionsResponse.json().data.length - 1);
        conditionIds = conditionsResponse.json().data[index].conditionId;
    }

    check(conditionsResponse, {
        "Conditions status is 200": (r) => r.status === 200,
    });

    let statesResponse = http.get(
        `${baseUrl}/master/v1/location/state?limit=40`,
        { headers }
    );
    if (statesResponse.data !== undefined && statesResponse.data.length > 0) {
        let index = generateRandomIndex(statesResponse.data.length - 1);
        stateId = statesResponse.data[index].stateId;
    }

    check(statesResponse, {
        "States status is 200": (r) => r.status === 200,
    });

    let placesAutocompleteResponse = http.get(
        `${baseUrl}/master/v1/location/places-autocomplete?input=${search}`,
        { headers }
    );
    // console.log(placesAutocompleteResponse.body);
    check(placesAutocompleteResponse, {
        "Places Autocomplete status is 200": (r) => r.status === 200,
    });

    let citiesByStateResponse = http.get(
        `${baseUrl}/master/v1/location/city?stateId=${stateId}`,
        { headers }
    );

    check(citiesByStateResponse, {
        "Cities by State status is 200": (r) => r.status === 200,
    });

    let studioResponse;
    let allAddressesResponse;

    let url = `${baseUrl}/users/v1/user-management?limit=60&conditionIds=${conditionIds}&isExpert=true`;
    if ((RescheduleMode = "Home Visit")) {
        allAddressesResponse = http.get(
            `${baseUrl}/users/v1/customer-management/all-addresses?customerId=${customerId}`,
            { headers }
        );
        if (allAddressesResponse.json().length > 0) {
            let index = generateRandomIndex(allAddressesResponse.json().length - 1);
            pincode = allAddressesResponse.json()[index].pincode;
            Address = allAddressesResponse.json()[index].address
        }
        url = url.concat(`&appointmentModes=Home+Visit&pincode=${pincode ? pincode : "560038"}`);
        check(allAddressesResponse, {
            "All Addresses Status is 200": (r) => r.status === 200,
        });
    } else if ((RescheduleMode = "Studio Visit")) {
        studioResponse = http.get(`${baseUrl}/master/v1/studio?limit=60`, {
            headers,
        });
        if (studioResponse.json().length > 0) {
            let index = generateRandomIndex(studioResponse.json().length - 1);
            studioId = studioResponse.json()[index];
        }
        url = url.concat(`&appointmentModes=Studio+Visit&studioId=${studioId}`);
        check(studioResponse, {
            "Studio Status is 200": (r) => r.status === 200,
        });
    }
   
    const expertManagementResponse = http.get(url, { headers });
    if(expertManagementResponse.json().data.length > 0){
        let index = generateRandomIndex(expertManagementResponse.json().data.length - 1);
        expertId = expertManagementResponse.json().data[index].userId;
    }
    check(expertManagementResponse, {
        "Expert Management Status is 200": (r) => r.status === 200,
    });

    const slotResponse = http.get(`${baseUrl}:3010/appointment/v1/admin-management/slots/${expertId}?mode=${(RescheduleMode == 'Home Visit' || 'Studio Visit')? RescheduleMode.split(' ').join('+'): RescheduleMode }&month=${getCurrentMonth()}&customerId=${customerId}`
    , { headers });
    console.log(`${baseUrl}:3010/appointment/v1/admin-management/slots/${expertId}?mode=${(RescheduleMode == 'Home Visit' || 'Studio Visit')? RescheduleMode.split(' ').join('+'): RescheduleMode}&month=${getCurrentMonth()}&customerId=${customerId}`
    )
    if(slotResponse.json().data.length > 0){
        let filterData = slotResponse.json().data.filter(item => item.slots.length > 0)
        let index = generateRandomIndex(filterData.length - 1);
        slot = filterData[index].slots[0];
    }
    check(expertManagementResponse, {
        "Expert Management Status is 200": (r) => r.status === 200,
    });



    const reschedulePayload = {
        expertId: expertId,
        customerId: customerId,
        customerName: "Saloni",
        conditionId: conditionIds,
        appointmentType: "Expert Counselling",
        appointmentMode: RescheduleMode,
        fromDt: convertDateFormat(slot.dt, slot.fromTime),
        toDt: convertDateFormat(slot.dt, slot.toTime),
        appointmentCity : 'bengaluru',
        homeVisitPincode: pincode? pincode: '560038',
        customerAddress : Address?Address: "custom address"

    };

  

    const rescheduleResponse = http.post(`${baseUrl}:3010/appointment/v1/admin-management/reschedule/${appointmentId}`, JSON.stringify(reschedulePayload), { headers });
    console.log(rescheduleResponse.body)
    check(rescheduleResponse, {
        "Reschedule Response Status is 201": (r) => r.status === 201,
    });

  







}
