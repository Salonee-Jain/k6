// import http from "k6/http";
// import { sleep, check } from "k6";
// import { generateRandomIndex, extractCityStateAndPincode, convertDateFormat, getCurrentMonth } from "../../helper.js";
// import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

// export let options = {
//     vus: 10,
//     iterations: 10,
//     duration: "1s",
//     // rps: 100,
//     thresholds: {
//         http_req_receiving: ["p(95)<300"],
//     },
// };
// const baseUrl = "http://localhost";
// let headers = { "Content-Type": "application/json" };
// let XAccessToken;
// let vendorId;
// const fileData = open('../../customer/download.pdf', 'b');


// export default function () {
//     loginFlow();
//     vendorFlow();
// }

// function loginFlow() {
//     let verifyPasswordPayload = JSON.stringify({
//         email: "varun.v@gida.io",
//         password: "Smart@1212",
//         os: "web",
//         deviceId: "web",
//         osVersion: "web",
//         manufacturer: "web",
//     });
//     const verifyPasswordResponse = http.post(
//         `${baseUrl}/users/v1/public/verify-password`,
//         verifyPasswordPayload,
//         { headers }
//     );
//     check(verifyPasswordResponse, {
//         "Verify Password status is 201": (res) => {
//             return res.status === 201;
//         },
//     });

//     const verifyOtpPayload = JSON.stringify({
//         email: "varun.v@gida.io",
//         otp: "123456",
//         os: "web",
//         deviceId: "web",
//         osVersion: "web",
//         manufacturer: "web",
//     });

//     const verifyOtp = http.post(
//         `${baseUrl}/users/v1/public/verify-otp`,
//         verifyOtpPayload,
//         { headers }
//     );
//     if (verifyOtp.status === 201) {
//         XAccessToken = verifyOtp.headers["X-Access-Token"];
//         headers = {
//             "Content-Type": "application/json",
//             "X-Access-Token": XAccessToken,
//         };
//     }
//     check(verifyOtp, {
//         "Verify Otp status is 201": (res) => {
//             return res.status === 201;
//         },
//     });
// }

// function vendorFlow(){
//     const getVendorsResponse = http.get(`${baseUrl}/inventory/v1/zoho-vendor?search&limit=10&offset=1`, { headers });
//     check(getVendorsResponse, { 'GET Vendors Status is 200': (r) => r.status === 200 });

//     const postUploadPayload = {
//         'document': open('/path/to/binary/file', 'b'), // Replace with the actual binary file path
//     };
//     const fd = new FormData();
//     fd.append( "document",  http.file(fileData, 'application/pdf'))
//     headers['Content-Type'] = `multipart/form-data; boundary=${fd.boundary}` ;

//     const postUploadResponse1 = http.post(`${baseUrl}/uploads/v1/upload/vendor?customfieldId=1256121000000161352`, fd.body(), { headers });
//     check(postUploadResponse1, { 'POST Upload Status is 200': (r) => r.status === 200 });

//     const postUploadResponse2 = http.post(`${baseUrl}/uploads/v1/upload/vendor?customfieldId=1256121000000161367`, fd.body(), { headers });
//     check(postUploadResponse2, { 'POST Upload Status is 200': (r) => r.status === 200 });

//     const postUploadResponse3 = http.post(`${baseUrl}/uploads/v1/upload/vendor?customfieldId=1256121000000161371`, fd.body(), { headers });
//     check(postUploadResponse3, { 'POST Upload Status is 200': (r) => r.status === 200 });

//     const postUploadResponse4 = http.post(`${baseUrl}/uploads/v1/upload/vendor?customfieldId=1256121000000161379`, fd.body(), { headers });
//     check(postUploadResponse4, { 'POST Upload Status is 200': (r) => r.status === 200 });


//     headers['Content-Type'] = 'application/json';


//     const postVendorPayload = {
//         "contact_name": "vendor deleted",
//         "vendor_name": "vendor deleted",
//         "company_name": "name",
//         "website": "",
//         "contact_persons": [
//             {
//                 "first_name": "name",
//                 "last_name": "",
//                 "email": "name@gmail.com",
//                 "phone": "",
//                 "mobile": "6543456787",
//                 "is_primary_contact": true
//             }
//         ],
//         "billing_address": {
//             "attention": "name",
//             "address": "name",
//             "street2": "name",
//             "city": "name",
//             "state": "name",
//             "zip": 234567,
//             "country": "name"
//         },
//         "shipping_address": {
//             "attention": "name",
//             "address": "name",
//             "street2": "name",
//             "city": "name",
//             "state": "name",
//             "zip": 434567,
//             "country": "name"
//         },
//         "contact_type": "vendor",
//         "payment_terms": -2,
//         "payment_terms_label": "Due end of the month",
//         "gst_treatment": "business_none",
//         "gst_no": "",
//         "custom_fields": [
//             {
//                 "api_name": "cf_goods_services_offered",
//                 "value": "1256121000001585004"
//             },
//             {
//                 "api_name": "cf_confidentiality_agreement",
//                 "value": "1256121000001586003"
//             },
//             {
//                 "api_name": "cf_coverage_of_loss_agreement",
//                 "value": "1256121000001586007"
//             },
//             {
//                 "api_name": "cf_termination_clauses",
//                 "value": "1256121000001588003"
//             },
//             {
//                 "api_name": "cf_sub_ledger_classification_a",
//                 "value": ""
//             },
//             {
//                 "api_name": "cf_gstin_nature",
//                 "value": "business_none"
//             },
//             {
//                 "api_name": "cf_site_location_tagging",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_concerned_antara_user",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_tds_info",
//                 "value": "No Deduction"
//             },
//             {
//                 "api_name": "cf_tds_value",
//                 "value": 0
//             },
//             {
//                 "api_name": "cf_parent_account_of_vendor",
//                 "value": "INVENTORY - CWIP"
//             },
//             {
//                 "api_name": "cf_beneficiary_name",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_bank_name",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_account_number",
//                 "value": "123456789098765432"
//             },
//             {
//                 "api_name": "cf_re_enter_account_number",
//                 "value": "123456789098765432"
//             },
//             {
//                 "api_name": "cf_ifsc",
//                 "value": "gfvg6787765"
//             },
//             {
//                 "api_name": "cf_msme_status",
//                 "value": "Unregistered"
//             }
//         ]
//     };
//     const postVendorResponse = http.post(`${baseURL}/inventory/v1/zoho-vendor`, JSON.stringify(postVendorPayload), { headers });
//     check(postVendorResponse, { 'POST Vendor Status is 201': (r) => r.status === 201 });

//     if(postVendorResponse.status === 201){
//         vendorId = postVendorResponse.json().contact_id;
//     }

  

//     const putVendorPayload = {
//         "contact_name": "vendor deleted",
//         "vendor_name": "vendor deleted",
//         "company_name": "name jain",
//         "website": "",
//         "contact_persons": [
//             {
//                 "first_name": "name",
//                 "last_name": "",
//                 "email": "name@gmail.com",
//                 "phone": "",
//                 "mobile": "6543456787",
//                 "is_primary_contact": true
//             }
//         ],
//         "billing_address": {
//             "attention": "name",
//             "address": "name",
//             "street2": "name",
//             "city": "name",
//             "state": "name",
//             "zip": 234567,
//             "country": "name"
//         },
//         "shipping_address": {
//             "attention": "name",
//             "address": "name",
//             "street2": "name",
//             "city": "name",
//             "state": "name",
//             "zip": 434567,
//             "country": "name"
//         },
//         "contact_type": "vendor",
//         "payment_terms": -2,
//         "payment_terms_label": "Due end of the month",
//         "gst_treatment": "business_none",
//         "gst_no": null,
//         "custom_fields": [
//             {
//                 "api_name": "cf_sub_ledger_classification_a",
//                 "value": ""
//             },
//             {
//                 "api_name": "cf_gstin_nature",
//                 "value": "business_none"
//             },
//             {
//                 "api_name": "cf_site_location_tagging",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_concerned_antara_user",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_tds_info",
//                 "value": "No Deduction"
//             },
//             {
//                 "api_name": "cf_tds_value",
//                 "value": 0
//             },
//             {
//                 "api_name": "cf_parent_account_of_vendor",
//                 "value": "INVENTORY - CWIP"
//             },
//             {
//                 "api_name": "cf_beneficiary_name",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_bank_name",
//                 "value": "name"
//             },
//             {
//                 "api_name": "cf_account_number",
//                 "value": "123456789098765432"
//             },
//             {
//                 "api_name": "cf_re_enter_account_number",
//                 "value": "123456789098765432"
//             },
//             {
//                 "api_name": "cf_ifsc",
//                 "value": "gfvg6787765"
//             },
//             {
//                 "api_name": "cf_msme_status",
//                 "value": "Unregistered"
//             },
//             {
//                 "api_name": "cf_msme_type",
//                 "value": ""
//             },
//             {
//                 "api_name": "cf_msme_number",
//                 "value": ""
//             }
//         ]
//     }

//     const putVendorResponse = http.put(`${baseURL}/inventory/v1/zoho-vendor/${vendorId}`, JSON.stringify(putVendorPayload), { headers });
//     check(putVendorResponse, { 'PUT Vendor Status is 200': (r) => r.status === 200 });

//     const deleteVendorResponse = http.del(`${baseURL}/inventory/v1/zoho-vendor?zohovendorId=${zohovendorId}`, null, { headers });
//     check(deleteVendorResponse, { 'DELETE Vendor Status is 204': (r) => r.status === 204 });

// }
