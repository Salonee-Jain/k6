import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    vus: 1,
    iterations: 1,
    duration: '30s',
    // thresholds: {
    //     'http_req_duration': ['p(95)<3000']
    // }
};

const baseUrl = 'https://localhost';
let headers = { 'Content-Type': 'application/json' }
let XAccessToken;
let customerId;
let cartId;
let lineItemId;
let productId = '8568460804395';
let variantId;
let lineItems = [];


export default function () {
    const sentPayload = JSON.stringify({
        mobile: '6362387858'
    })

    const sendOtpResponse = http.post(`${baseUrl}:3002/users/v1/public/send-otp`, sentPayload, { headers });
    check(sendOtpResponse, {
        'otp sent': (res) => { return res.status === 201 }
    });
    check(sendOtpResponse, {
        'otp sent Response time is less than 300ms': (res) => { console.log(res.timings.receiving); return res.timings.receiving < 300; }
    });

    //----------------------------------------------------------------
    const verifyPayload = JSON.stringify({
        "mobile": "6362387858",
        "otp": "123456",
        "os": "android",
        "deviceId": "1234567891",
        "osVersion": "10",
        "manufacturer": "samsung"
    })
    const verifyOtp = http.post(`${baseUrl}/users/v1/public/verify-otp`, verifyPayload, { headers });
    check(verifyOtp, {
        'otp verified': (res) => {
            XAccessToken = res.headers['X-Access-Token'];
            customerId = res.json().user.customerId
            headers = { 'Content-Type': 'application/json', 'X-Access-Token': XAccessToken }
            return res.status === 201
        }
    });
    check(verifyOtp, {
        'otp verify Response time is less than 300ms': (res) => { console.log(res.timings.receiving); return res.timings.receiving < 300; }
    });

    let recommendedResponse;
    if (customerId) {
        recommendedResponse = http.get(`${baseUrl}:3020/catalog/v1/products/recommended?customerId=${customerId}`, { headers });
    } else {
        recommendedResponse = http.get(`${baseUrl}:3020/catalog/v1/products/recommended`, { headers });
    }

    check(recommendedResponse, {
        'recommended products endpoint status is 200': (res) => {
            const variants = res.json().recommendedProducts
                .map(product => (product.variants))
                .flat();
            variantId = variants.filter(variant => variant.quantityAvailable > 2)[0].variantId;
            if (variantId) {
                lineItems.push({ variantId, quantity: 1 })
            }

            return res.status === 200;
        }
    });
    check(recommendedResponse, {
        'recommended Response time is less than 300ms': (res) => { console.log(res.timings.receiving); return res.timings.receiving < 300; }
    });


    const catalogResponse = http.get(`${baseUrl}:3020/catalog/v1/products/get-all-categories?productLimit=3&limit=100&bestSeller=true`, { headers });
    check(catalogResponse, {
        'catalog endpoint status is 200': (res) => {
            const variants = res.json().data
                .map(product => (product.variants))
                .flat();
            variantId = variants.filter(variant => variant.quantityAvailable > 2)[0].variantId;
            if (variantId) {
                lineItems.push({ variantId, quantity: 1 })
            }
            return res.status === 200;
        }
    });
    check(catalogResponse, {
        'get all categories Response time is less than 300ms': (res) => { console.log(res.timings.receiving); return res.timings.receiving < 300; }
    });

    const cartResponse = http.get(`${baseUrl}:3020/catalog/v1/cart`, { headers });
    check(cartResponse, {
        'cart endpoint status is 200': (res) => { return res.status === 200; }
    });
    check(cartResponse, {
        'get Cart Response time is less than 300ms': (res) => { console.log(res.timings.receiving); return res.timings.receiving < 300; }
    });

    //----------------------------------------------------------------
    const addToCartPayload = JSON.stringify({
        lineItems
    })
    const addToCartResponse = http.post(`${baseUrl}:3020/catalog/v1/cart`, addToCartPayload, { headers });
    check(addToCartResponse, {
        'add to cart endpoint status is 201': (res) => {
            cartId = res.json().lineItems.cartId;
            variantId = res.json().lineItems.variantId;
            lineItemId = res.json().lineItems.lineItemId;
            return res.status === 201;
        }
    });
    check(addToCartResponse, {
        'Add to Cart Response time is less than 300ms': (res) => { return res.timings.receiving < 300; }
    });



    //----------------------------------------------------------------
    const updateToCartPayload = JSON.stringify({
        "lineItems": [
            {
                "cartLineId": lineItemId,
                "variantId": variantId,
                "quantity": 2
            }
        ]
    })
    const upadteToCartResponse = http.patch(`${baseUrl}:3020/catalog/v1/cart`, updateToCartPayload, { headers });
    check(upadteToCartResponse, {
        'add to cart endpoint status is 201': (res) => { console.log(res.body); return res.status === 201; }
    });
    check(upadteToCartResponse, {
        'Add to Cart Response time is less than 300ms': (res) => { return res.timings.receiving < 300; }
    });

        //------------------------------------------------------------------------------
        const deleteToCartPayload = JSON.stringify({
            "lineItems": [
                lineItemId
            ]
        })
        const deleteCartResponse = http.del(`${baseUrl}:3020/catalog/v1/cart`, deleteToCartPayload, { headers });
        check(deleteCartResponse, {
            'delete request to cart endpoint status is 204': (res) => {
                return res.status === 204;
            },
        });
        check(deleteCartResponse, {
            'delete Cart Response time is less than 300ms': (res) => {
                return res.timings.receiving < 300;
            },
        });



    //     //----------------------------------------------------------------
    //     const getReviewsResponse = http.get(`${baseUrl}:3020/catalog/v1/reviews/${productId}?offset=0&limit=10`, { headers });
    //     check(getReviewsResponse, {
    //         'GET request to reviews endpoint status is 200': (res) => {
    //             return res.status === 200;
    //         },
    //     });
    //     check(getReviewsResponse, {
    //         'GET Reviews Response time is less than 300ms': (res) => {
    //             return res.timings.receiving < 300;
    //         },
    //     });


        //----------------------------------------------------------------
        const allAddressesResponse = http.get(`${baseUrl}:3002/users/v1/profile/all-addresses`, { headers });
        check(allAddressesResponse, {
            'all addresses endpoint status is 200': (res) => { return res.status === 200; }
        });
        check(allAddressesResponse, {
            'All Addresses Response time is less than 300ms': (res) => { return res.timings.receiving < 300; }
        });


    //     //----------------------------------------------------------------

        const placeOrderpayload = JSON.stringify(
            {
                "products": [
                    {
                        "productVariationOptions": [
                            "Title"
                        ],
                        "lineItemId": "gid://shopify/CartLine/66109c8b-ea99-441f-99ff-7acfde9f96d6?cart=c1-cf1b9a5684703b0de2bc320e3a4b1002",
                        "variantTitle": "Default Title",
                        "variantId": "gid://shopify/ProductVariant/45333553643798",
                        "availableQuantity": 898,
                        "quantity": 1,
                        "productId": "gid://shopify/Product/8404794114326",
                        "summary": "Enhance joint health with clinically proven ingredients, including a highly efficacious form of collagen sourced from Spain. Hyaluronic Acid increases lubrication and mobility. Easy-to-take, delicious one-scoop powder with refreshing Kesar Elaichi flavor.",
                        "thumbnailUrl": "https://cdn.shopify.com/s/files/1/0739/1779/2534/files/Image1_5fa83796-2e40-4c42-ab39-efe0bd225c3f.jpg?v=1692114596",
                        "productName": "AGEasy Joint Care Advanced",
                        "productHandle": "joint-care-advanced",
                        "price": 999,
                        "subtotalAmount": 999,
                        "totalAmount": 999,
                        "Title": "Default Title",
                        "name": "AGEasy Joint Care Advanced",
                        "description": "Enhance joint health with clinically proven ingredients, including a highly efficacious form of collagen sourced from Spain. Hyaluronic Acid increases lubrication and mobility. Easy-to-take, delicious one-scoop powder with refreshing Kesar Elaichi flavor."
                    }
                ],
                "shippingAddress": {
                    "isDefault": false,
                    "enabled": 1,
                    "addressId": "ef225247-e77f-4cff-89e7-81d5516619cb",
                    "customerId": customerId,
                    "name": "Address 7",
                    "address": "Lallaaaa",
                    "city": "Gurgaon",
                    "state": "Haryana",
                    "pincode": "122002"
                },
                "source": "web"
            }
        );
        const paymentRequired = true;
        const placeOrderResponse = http.post(`${baseUrl}:3012/orders/v1/order-management/place-order?paymentRequired=${paymentRequired}`, JSON.stringify(placeOrderpayload), { headers });
        check(placeOrderResponse, {
            'place Order endpoint status is 2xx': (res) => res.status >= 200 && res.status < 300
        });

        //----------------------------------------------------------------
        const logoutResponse = http.post(`${baseUrl}:3002/users/v1/public/logout`, null , { headers });
        check(logoutResponse, {
            'Logout endpoint status is 201': (res) => res.status >= 200 && res.status < 300
        });
      sleep(1);
}
