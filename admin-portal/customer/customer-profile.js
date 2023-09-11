import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex, extractCityStateAndPincode, convertDateFormat } from "../../helper.js";
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
let RescheduleMode = ["Online", "Studio Visit", "Home Visit"][generateRandomIndex(2)];
let conditionIds;
let searchPlaces = 'or';
let pincode;
let city;
let state;
let placesId;
let Address;
let mobileNumber;
let addressId;
const fileData = open('./download.pdf', 'b');


export default function () {
    loginFlow();
    profileFlow();
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

function profileFlow() {
    const recentsResponse = http.get(`${baseUrl}/users/v1/customer-management/recents`, { headers });
    check(recentsResponse, {
        "Recents Status is 200": (r) => r.status === 200,
    });

    const customerSearchResponse = http.get(`${baseUrl}/users/v1/customer-management?offset=0&limit=15&search=${searchName}`, { headers });
    if (customerSearchResponse.json().data.length > 0) {
        let index = generateRandomIndex(customerSearchResponse.json().data.length - 1)
        customerId = customerSearchResponse.json().data[index].customerId
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

    const placesAutocompleteResponse = http.get(`${baseUrl}/master/v1/location/places-autocomplete?input=${searchPlaces}`, { headers });
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
    //------------------------------------------------------------------------------------------------
    const fd = new FormData();
    fd.append("type", "health_records");
    fd.append("file", http.file(fileData, 'image/jpeg'))
    headers['Content-Type'] = `multipart/form-data; boundary=${fd.boundary}`;
    const uploadPost = http.post(`${baseUrl}:3024/uploads/v1/upload?customerId=${customerId}`, fd.body(), { headers });
    console.log(uploadPost.body)
    check(uploadPost, {
        'Health Records - POST Status is 201': (res) => res.status === 201,
    });
    headers['Content-Type'] = 'application/json';


    const customerDocumentResponse = http.get(`${baseUrl}/users/v1/customer-management/document/all-documents?customerId=${customerId}&documentType=Health+Record`, { headers });
    check(customerDocumentResponse, {
        "Customer Document Status is 200": (r) => r.status === 200,
    });


    const addressPayload = JSON.stringify({
        "isDefault": false,
        "name": "Address",
        "contactNumber": mobileNumber,
        "address": Address ? Address : "Ramdon Address",
        "lat": 0,
        "lng": 0,
        "pincode": pincode,
        "city": city,
        "state": state,
        "customerId": customerId
    });
    let addressResponse;
    if(!addressId){
    addressResponse = http.post(`${baseUrl}:3002/users/customer-management/address?customerId=${customerId}`, addressPayload, { headers });
    console.log(addressResponse.body)
    }else{
        addressResponse = http.patch(`${baseUrl}:3002/users/customer-management/address/${addressId}`, addressPayload, { headers });
        console.log(addressResponse.body)
    }
    check(addressResponse, {
        "Address Status is 201": (r) => r.status === 201,
    });
}