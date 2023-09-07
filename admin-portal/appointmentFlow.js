import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomIndex, generateRandomMobileNumber } from '../helper.js'


export let options = {
    vus: 1,
    iterations: 1,
    duration: '1s',
    // rps: 100,
    thresholds: {
        'http_req_receiving': ['p(95)<300']
    }
};
const baseUrl = 'http://localhost';
let headers = { 'Content-Type': 'application/json' };
let XAccessToken;
let stateId;
let search = 'Organic'



export default function () {
    loginFlow();
    appointmentFlow();
}

let appointmentId;




function loginFlow() {

    let verifyPasswordPayload = JSON.stringify({
        email: 'varun.v@gida.io',
        password: 'Smart@1212',
        os: 'web',
        deviceId: 'web',
        osVersion: 'web',
        manufacturer: 'web',
    })
    const verifyPasswordResponse = http.post(`${baseUrl}/users/v1/public/verify-password`, verifyPasswordPayload, { headers });
    check(verifyPasswordResponse, {
        'Verify Password status is 201': (res) => {
            return res.status === 201
        }
    });

    const verifyOtpPayload = JSON.stringify({
        email: 'varun.v@gida.io',
        otp: '123456',
        os: 'web',
        deviceId: 'web',
        osVersion: 'web',
        manufacturer: 'web',
    })

    const verifyOtp = http.post(`${baseUrl}/users/v1/public/verify-otp`, verifyOtpPayload, { headers });
    if (verifyOtp.status === 201) {
        XAccessToken = verifyOtp.headers['X-Access-Token'];
        headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
    }
    check(verifyOtp, {
        'Verify Otp status is 201': (res) => {
            //console.log(res.body)
            return res.status === 201
        }
    });
}


function appointmentFlow() {
    let userManagementResponse = http.get(
        `${baseUrl}/users/v1/user-management?limit=10&isExpert=true`, { headers }
    );

    check(userManagementResponse, {
        'User Management status is 200': (r) => { return r.status === 200 },
    });


    let studioResponse = http.get(
        `${baseUrl}/master/v1/studio?limit=60`, { headers }
    );

    check(studioResponse, {
        'Studio status is 200': (r) => { return r.status === 200 },
    });




    function getAllAppointments(offset = 0, limit = 10, status = '', fromDt = '', toDt = '') {
        const queryParams = {
            offset,
            limit,
            status,
            sortBy: 'date',
            reverse: true,
            fromDt,
            toDt,
        };

        const url = `${baseUrl}:3010/appointment/v1/admin-management/all-appointments?` +
            Object.entries(queryParams)
                .filter(([_, value]) => value !== '') // Exclude empty parameters
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');

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

    let ScheduledAllAppointmentsResponse = getAllAppointments(0, 10, 'Scheduled', '', '');
   
    if (ScheduledAllAppointmentsResponse.json().data.length > 0) {
        let index = generateRandomIndex(ScheduledAllAppointmentsResponse.json().data.length - 1);
        appointmentId = ScheduledAllAppointmentsResponse.json().data[index].appointmentId;
    }
    check(ScheduledAllAppointmentsResponse, {
        'All Appointments Variation 3 status is 200': (r) => r.status === 200,
    });


    let sendReminderResponse = http.post(
        `${baseUrl}:3010/appointment/v1/admin-management/reminder/${appointmentId}`,
        { headers }
    );
    console.log(sendReminderResponse.body)

    check(sendReminderResponse, {
        'Send Reminder status is 200': (r) => r.status === 200,
    });


    // let cancelAppointmentResponse = http.post(
    //     `${baseUrl}/appointment/v1/admin-management/cancel/${appointmentId}`,
    //     { headers }
    // );

    // check(cancelAppointmentResponse, {
    //     'Cancel Appointment status is 200': (r) => r.status === 200,
    // });




    // let conditionsResponse = http.get(
    //     `${baseUrl}/master/v1/condition`,
    //     { headers }
    // );

    // check(conditionsResponse, {
    //     'Conditions status is 200': (r) => r.status === 200,
    // });


    //   let statesResponse = http.get(
    //     `${baseUrl}/master/v1/location/state?limit=40`,
    //     { headers }
    //   );
    //   if(statesResponse.data.length > 0){
    //     let index =  generateRandomIndex(statesResponse.data.length - 1)
    //     stateId = statesResponse.data[index].stateId
    //   }

    //   check(statesResponse, {
    //     'States status is 200': (r) => r.status === 200,
    //   });


    //   let placesAutocompleteResponse = http.get(
    //     `${baseUrl}/master/v1/location/places-autocomplete?input=${search}`
    //   );

    //   check(placesAutocompleteResponse, {
    //     'Places Autocomplete status is 200': (r) => r.status === 200,
    //   });


    //   let citiesByStateResponse = http.get(
    //     `${baseUrl}/master/v1/location/city?stateId=${stateId}`,
    //     {headers}
    //   );

    //   check(citiesByStateResponse, {
    //     'Cities by State status is 200': (r) => r.status === 200,
    //   });


}
