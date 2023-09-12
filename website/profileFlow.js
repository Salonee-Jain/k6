import http from 'k6/http';
import { sleep, check, group } from 'k6';
import encoding from 'k6/encoding';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';
import { generateRandomIndex, generateRandomMobileNumber } from '../helper.js';

export let options = {
    vus: 1,
    iterations: 1,
    duration: '10s',
    // rps: 100,
    thresholds: {
        'http_req_receiving': ['p(95)<300']
    }
};
const baseUrl = 'http://localhost';
let headers = { 'Content-Type': 'application/json' };
let downloadDocument;
let downloadToken;

const mobileNumber =  generateRandomMobileNumber();
const sentPayload = JSON.stringify({
    mobile: mobileNumber
})

let XAccessToken;
const verifyPayload = JSON.stringify({
    "mobile": mobileNumber,
    "otp": "123456",
    "os": "android",
    "deviceId": "1234567891",
    "osVersion": "10",
    "manufacturer": "samsung"
})
// const fileData = open('./sign.jpeg', 'b');

export default function () {


    group('Send and Verify OTP', function () {
        // Send OTP request
        const sendOtpResponse = http.post(`${baseUrl}:3002/users/v1/public/send-otp`, sentPayload, { headers });
        check(sendOtpResponse, {
            'OTP Sent - Status is 201': (res) => res.status === 201,
        });
        const verifyOtp = http.post(`${baseUrl}:3002/users/v1/public/verify-otp`, verifyPayload, { headers });
        if (verifyOtp.status === 201) {
            XAccessToken = verifyOtp.headers['X-Access-Token'];
            headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
        }
        check(verifyOtp, {
            'OTP Verified - Status is 200': (res) => res.status === 201,
        });
    });

    group('Personal Details', function () {
        const profileGet = http.get(`${baseUrl}:3002/users/v1/profile`, { headers });
        check(profileGet, {
            'Personal Details - GET Status is 200': (res) => { return res.status === 200 }
        });

        const profilePatch = http.patch(`${baseUrl}:3002/users/v1/profile`, JSON.stringify({
            "name": "SaloniS"
        }), { headers });
        check(profilePatch, {
            'Personal Details - PATCH Status is 200': (res) => res.status === 200,
        });
    });

    // group('Orders', function () {
    //     const ordersGet = http.get(`${baseUrl}:3012/orders/v1/customer`, { headers });
    //     check(ordersGet, {
    //         'Orders - GET Status is 200': (res) => res.status === 200,
    //     });
    // });

    // group('Health Records', function () {
    //     const toDt = new Date().toISOString().split('T')[0];
    //     const fromDt = new Date();
    //     fromDt.setMonth(fromDt.getMonth() - 1);
    //     const fromDtStr = fromDt.toISOString().split('T')[0];

    //     function getHealthRecords() {
    //         const healthRecordsGet = http.get(`${baseUrl}/users/v1/profile/all-documents?fromDt=${fromDtStr}&toDt=${toDt}`, { headers });
    //       if(healthRecordsGet.json().data.length > 0){
    //         let index = generateRandomIndex(healthRecordsGet.json().data.length - 1)
    //         downloadDocument = healthRecordsGet.json().data[index]
    //       }
    //         check(healthRecordsGet, {
    //             'Health Records - GET Status is 200': (res) => res.status === 200,
    //         });
    //     }
    //     getHealthRecords();

    //     const fd = new FormData();
    //     fd.append("type", "health_records");
    //     fd.append( "file",  http.file(fileData, 'image/jpeg'))
    //     headers['Content-Type'] = `multipart/form-data; boundary=${fd.boundary}` ;
    //     const uploadPost = http.post(`${baseUrl}:3024/uploads/v1/upload`, fd.body(), { headers });
    //     console.log(uploadPost.body)
    //     check(uploadPost, {
    //         'Health Records - POST Status is 200': (res) => res.status === 201,
    //     });
    //     headers['Content-Type'] = 'application/json';
    //     getHealthRecords();
    //     let customerDocumentId = downloadDocument.customerDocumentId;
    //     console.log(customerDocumentId)
    //      const getdownloadToken = http.get(`${baseUrl}:3024/uploads/v1/download/download-token?customerDocumentId=${customerDocumentId}`,
    //      {headers});
    //      downloadToken = getdownloadToken.body
    //     check(getdownloadToken, {
    //         'Health Records - getdownloadToken GET Status is 200': (res) => res.status === 200,
    //     });

    //     const downloadGetResponse = http.get(`${baseUrl}:3024/uploads/v1/download?customerDocumentId=${customerDocumentId}&token=${downloadToken}`, { headers });
    //     console.log(downloadGetResponse.status)
    //     check(downloadGetResponse, {
    //         'Health Records - DOWNLOAD document GET Status is 200': (res) => res.status === 200,
    //     });

    //     const deleteDocument = http.del(`${baseUrl}/users/v1/profile/document/${customerDocumentId}`, { headers });
    //     check(deleteDocument, {
    //         'Health Records - DELETE Status is 200': (res) => res.status === 200,
    //     });
    // });

    // group('Notification', function () {
    //     const notificationGet = http.get(`${baseUrl}:3008/notification/v1/apis`, { headers });
    //     check(notificationGet, {
    //         'Notification - GET Status is 200': (res) => res.status === 200,
    //     });
    // });

    let addressId;
    // group('Manage Address', function () {


       

        const allAddressesGet = http.get(`${baseUrl}:3002/users/v1/profile/all-addresses`, { headers });
       
        check(allAddressesGet, {
            'Manage Address - All Addresses GET Status is 200': (res) => res.status === 200,
        });

        const postAddress = http.post(`${baseUrl}:3002/users/v1/profile/address`, JSON.stringify({
            "name": "Office",
            "address": "323454321 234",
            "pincode": "560038",
            "city": "Bengaluru",
            "state": "Karnataka",
            "isDefault": false,
            "customerName": "ss 3eee",
            "contactNumber": "6362387858"
        }), { headers });
        console.log(postAddress.json(), postAddress.status);
        if (postAddress.status === 201) {
            addressId = postAddress.json()[0].addressId
        }
        check(postAddress, {
            'Manage Address - Post Address Status is 201': (res) => res.status === 201,
        });

        console.log(addressId);
        const patchAddress = http.patch(`${baseUrl}/users/v1/profile/address/${addressId}`, JSON.stringify({
            "name": "Home",
            "address": "A10 Street 1",
            "pincode": "560038",
            "city": "Bengaluru",
            "state": "Karnataka",
            "isDefault": false,
            "customerName": "Home a",
            "contactNumber": "6362387858"
        }), { headers });
        console.log(patchAddress.body)
        check(patchAddress, {
            'Manage Address - Patch Address Status is 200': (res) => res.status === 200,
        });

        const deleteAddress = http.del(`${baseUrl}/users/v1/profile/address/${addressId}`, {headers});
        check(deleteAddress, {
            'Manage Address - Delete Address Status is 200': (res) => res.status === 200,
        });
        console.log(deleteAddress.body)
    // });
}






