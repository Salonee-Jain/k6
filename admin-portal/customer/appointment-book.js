import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex, extractCityStateAndPincode, convertDateFormat, getCurrentMonth } from "../../helper.js";
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

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
const fileData = open('./download.pdf', 'b');
let slot;
let appointmentId;


export default function () {
    loginFlow();
    bookAppointmentFlow();
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
            //console.log(res.body)
            return res.status === 201;
        },
    });
}

function bookAppointmentFlow(){
    const recentsResponse = http.get(`${baseUrl}/users/v1/customer-management/recents`, { headers });
    check(recentsResponse, {
        "Recents Status is 200": (r) => r.status === 200,
    });

    const customerSearchResponse = http.get(`${baseUrl}/users/v1/customer-management?offset=0&limit=15&search=${searchName}`, { headers });
    if (customerSearchResponse.json().data.length > 0) {
        let index = generateRandomIndex(customerSearchResponse.json().data.length - 1)
        customerId = customerSearchResponse.json().data[index].customerId;
        customerName = customerSearchResponse.json().data[index].name;
        mobileNumber = customerSearchResponse.json().data[index].mobileNumber;
    }
    check(customerSearchResponse, {
        "Customer Search Status is 200": (r) => r.status === 200,
    });

    const customerDetailsResponse = http.get(`${baseUrl}/users/v1/customer-management/${customerId}`, { headers });
  
    if (customerDetailsResponse.json().addresses.length > 0) {
       addressId = customerDetailsResponse.json().addresses[0].addressId;
    }
    check(customerDetailsResponse, {
        "Customer Details Status is 200": (r) => r.status === 200,
    });

    const appointmentResponse = http.get(`${baseUrl}:3010/appointment/v1/admin-management/${customerId}?limit=20`, { headers });
    check(appointmentResponse, {
        "Appointment Status is 200": (r) => r.status === 200,
    });

    const ordersResponse = http.get(`${baseUrl}:3012/orders/v1/customer/admin/${customerId}?offset=0&limit=20`, { headers });
    check(ordersResponse, {
        "Orders Status is 200": (r) => r.status === 200,
    });

    const conditionsResponse = http.get(`${baseUrl}/master/v1/condition`, { headers });
    if (conditionsResponse.json().data.length > 0) {
        let index = generateRandomIndex(conditionsResponse.json().data.length - 1);
        conditionIds = conditionsResponse.json().data[index].conditionId;
    }
    check(conditionsResponse, {
        "Conditions Status is 200": (r) => r.status === 200,
    });

    const placesAutocompleteResponse = http.get(`${baseUrl}/master/v1/location/places-autocomplete?input=${search}`, { headers });
    check(placesAutocompleteResponse, {
        "Places Autocomplete Status is 200": (r) => r.status === 200,
    });
    if (placesAutocompleteResponse.json().predictions.length > 0) {
        let index = generateRandomIndex(placesAutocompleteResponse.json().predictions.length - 1);
        Address = placesAutocompleteResponse.json().predictions[index].description;
        placesId = placesAutocompleteResponse.json().predictions[index].place_id
    }

    const placeDetailsResponse = http.get(`${baseUrl}/master/v1/location/place-details?placeId=${placesId}`, { headers });
    if (placeDetailsResponse.json().result.address_components.length > 0) {
        city = extractCityStateAndPincode(placeDetailsResponse.json().result.address_components).city;
        state = extractCityStateAndPincode(placeDetailsResponse.json().result.address_components).state
        pincode = extractCityStateAndPincode(placeDetailsResponse.json().result.address_components).pincode
    }
    check(placeDetailsResponse, {
        "Place Details Status is 200": (r) => r.status === 200,
    });

    let studioResponse;
    let allAddressesResponse;

    let url = `${baseUrl}/users/v1/user-management?limit=60&conditionIds=${conditionIds.replace('-', '')}&isExpert=true`;
    if (mode === "Home Visit") {
        allAddressesResponse = http.get(
            `${baseUrl}/users/v1/customer-management/all-addresses?customerId=${customerId}`,
            { headers }
        );
        if (allAddressesResponse.json().length > 0) {
            let index = generateRandomIndex(allAddressesResponse.json().length - 1);
            pincode = allAddressesResponse.json()[index].pincode;
            Address = allAddressesResponse.json()[index].address
        }
        check(allAddressesResponse, {
            "All Addresses Status is 200": (r) => r.status === 200,
        });
        url = url.concat(`&appointmentModes=Home+Visit&pincode=${pincode ? pincode : "560038"}`);
       
    } else if (mode === "Studio Visit") {
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
    console.log(url)
   
    const expertManagementResponse = http.get(url, { headers });
    if(expertManagementResponse.json().data.length > 0){
        let index = generateRandomIndex(expertManagementResponse.json().data.length - 1);
        expertId = expertManagementResponse.json().data[index].userId;
    }

    check(expertManagementResponse, {
        "Expert Management Status is 200": (r) => r.status === 200,
    });
let month = getCurrentMonth();

    const slotResponse = http.get(`${baseUrl}:3010/appointment/v1/admin-management/slots/${expertId}?mode=${(mode == 'Home Visit' || 'Studio Visit')? mode.split(' ').join('+'): mode }&month=${month}&customerId=${customerId}`
    , { headers });
    if(slotResponse.json().data != undefined && slotResponse.json().data.length > 0){
        let filterData = slotResponse.json().data.filter(item => item.slots.length > 0)
        let index = generateRandomIndex(filterData.length - 1);
        slot = filterData[index].slots[0];
     
}



    const schedulePayload = JSON.stringify({
        expertId: expertId,
        customerId: customerId,
        customerName: customerName,
        conditionId: conditionIds,
        appointmentType: "Expert Counselling",
        appointmentMode: mode,
        fromDt: convertDateFormat(slot.dt, slot.fromTime),
        toDt: convertDateFormat(slot.dt, slot.toTime),
        appointmentCity : 'bengaluru',
        homeVisitPincode: pincode? pincode: '560038',
        customerAddress : Address?Address: "custom address"

    });

  

    const scheduleResponse = http.post(`${baseUrl}:3010/appointment/v1/admin-management/schedule`, schedulePayload, { headers });
    check(scheduleResponse, {
        "Schedule Response Status is 201": (r) => r.status === 201,
    });

}