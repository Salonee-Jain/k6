import http from "k6/http";
import { sleep, check } from "k6";
import { generateRandomIndex } from "../helper.js";

export let options = {
    vus: 1,
    iterations: 1,
    duration: "30s",
    thresholds: {
        'http_req_duration': ['p(95)<3000']
    }
};

const baseUrl = "http://localhost";
let search = "brace";
let headers = { "Content-Type": "application/json" };
let XAccessToken;
let customerId;
let cartId;
let lineItemId;
let productId;
let variantId;
let lineItems = [];
let handle = "advanced_knee_cap";
let Address = "";
const paymentRequired = false;

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
            return res.status === 201;
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
        `${baseUrl}/users/v1/public/verify-otp`,
        verifyPayload,
        { headers }
    );
    check(verifyOtp, {
        "otp verified": (res) => {
            XAccessToken = res.headers["X-Access-Token"];
            customerId = res.json().user.customerId;
            headers = {
                "Content-Type": "application/json",
                "X-Access-Token": XAccessToken,
            };
            return res.status === 201;
        },
    });

    let recommendedResponse;
    if (customerId) {
        recommendedResponse = http.get(
            `${baseUrl}:3020/catalog/v1/products/recommended?customerId=${customerId}`,
            { headers }
        );
    } else {
        recommendedResponse = http.get(
            `${baseUrl}:3020/catalog/v1/products/recommended`,
            { headers }
        );
    }
    check(recommendedResponse, {
        "recommended products endpoint status is 200": (res) => {
            return res.status === 200;
        },
    });

    const productbyHandleResponse = http.get(
        `${baseUrl}:3020/catalog/v1/products/${handle}`,
        { headers }
    );
    if (productbyHandleResponse.status === 200) {
        productId = productbyHandleResponse.json().productId.split("/").pop();
    }
    check(productbyHandleResponse, {
        "product by handle endpoint status is 200": (res) => {
            return res.status === 200;
        },
    });

    // const productReviewResponse = http.get(`${baseUrl}:3020/catalog/reviews/${productId}?limit=10&offset=0`, { headers });
    // check(productReviewResponse, {
    //     'productReviewResponse endpoint status is 200': (res) => {
    //         console.log(res.body)
    //         return res.status === 200;
    //     }
    // });

    const productResponse = http.get(
        `${baseUrl}:3020/catalog/v1/products?search=${search}`,
        { headers }
    );
    check(productResponse, {
        "productResponse endpoint status is 200": (res) => {
            return res.status === 200;
        },
    });

    const catalogResponse = http.get(
        `${baseUrl}:3020/catalog/v1/products/get-all-categories?productLimit=3&bestSeller=true`,
        { headers }
    );
    if (catalogResponse.status === 200) {
        const variants = catalogResponse
            .json()
            .categories.flatMap((category) => category.products)
            .flatMap((product) =>
                product.variants.filter((variant) => variant.quantityAvailable > 2)
            );
        // console.log(variants)

        if (variants.length > 0) {
            const numItemsToAdd = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
            const addedVariantIds = [];

            for (let i = 0; i < numItemsToAdd; i++) {
                let randomVariant;
                do {
                    const randomIndex = Math.floor(Math.random() * variants.length);
                    randomVariant = variants[randomIndex];
                } while (addedVariantIds.includes(randomVariant.variantId));
                lineItems.push({ variantId: randomVariant.variantId, quantity: 1 });
                addedVariantIds.push(randomVariant.variantId);
            }
            // console.log(lineItems)
        }
    }
    check(catalogResponse, {
        "catalog endpoint status is 200": (res) => {
            return res.status === 200;
        },
    });

    //----------------------------------------------------------------
    function getCart() {
        const cartResponse = http.get(`${baseUrl}:3020/catalog/v1/cart`, {
            headers,
        });
        if (cartResponse.json().lineItems.length > 0) {
            let index = generateRandomIndex(cartResponse.json().lineItems.length - 1);
            lineItemId = cartResponse.json().lineItems[index].lineItemId;
            variantId = cartResponse.json().lineItems[index].variantId;
        }
        check(cartResponse, {
            "cart endpoint status is 200": (res) => {
                return res.status === 200;
            },
        });
        if (cartResponse.json().lineItems.length > 1) {
            return true;
        } else {
            return false;
        }
    }

    //----------------------------------------------------------------
    const addToCartPayload = JSON.stringify({
        lineItems
    })
    const addToCartResponse = http.post(`${baseUrl}:3020/catalog/v1/cart`, addToCartPayload, { headers });
    // console.log(addToCartResponse.json().lineItems)
    check(addToCartResponse, {
        'add to cart endpoint status is 201': (res) => {
            return res.status === 201;
        }
    });
    getCart();

    const updateToCartPayload = JSON.stringify({
        lineItems: [
            {
                cartLineId: lineItemId,
                variantId: variantId,
                quantity: 1,
            },
        ],
    });
    const upadteToCartResponse = http.patch(
        `${baseUrl}:3020/catalog/v1/cart`,
        updateToCartPayload,
        { headers }
    );
    check(upadteToCartResponse, {
        "update to cart endpoint status is 201": (res) => {
            return res.status === 200;
        },
    });

    let itemsToBeDeleted = getCart();

    if (itemsToBeDeleted) {
        const deleteToCartPayload = JSON.stringify({
            lineItems: [lineItemId],
        });
        const deleteCartResponse = http.del(
            `${baseUrl}:3020/catalog/v1/cart`,
            deleteToCartPayload,
            { headers }
        );
        check(deleteCartResponse, {
            "delete request to cart endpoint status is 204": (res) => {
                return res.status === 200;
            },
        });
    }
    getCart();


    const getAllAddress = http.get(`${baseUrl}:3002/users/v1/profile/all-addresses`, { headers });
    if (getAllAddress.json().length > 0) {
        let index = generateRandomIndex(getAllAddress.json().length - 1)
        Address = getAllAddress.json()[index]
    }
    check(getAllAddress, {
        'getAllAddress endpoint status is 200': (res) => { return res.status === 200; }
    });


    //----------------------------------------------------------------
    const getCartValue = http.get(`${baseUrl}:3020/catalog/v1/cart`, {
        headers,
    });

    if (Address === undefined) {
        const AddressPayload = JSON.stringify({
            "name": "Office",
            "address": "Dno 8 Wdno 147, Kambli Bazar, Ballari",
            "buildingNo": "7",
            "lat": 0,
            "lng": 0,
            "pincode": "560038",
            "city": "Bengaluru",
            "state": "Karnataka",
            "contactNumber": "6362387858",
            "customerName": "Saloni Jain"
        })
        const AddressResponse = http.post(`${baseUrl}:3002/users/v1/profile/address`, AddressPayload, {
            headers,
        });
        Address = AddressResponse.json()[0];
    }

    const placeOrderpayload = JSON.stringify({
        "products": getCartValue.json().lineItems.map(product => {
            const newProduct = {
                "name": product.productName,
                "productVariationOptions": product.productVariationOptions,
                "lineItemId": product.lineItemId,
                "variantTitle": product.variantTitle,
                "variantId": product.variantId,
                "availableQuantity": product.availableQuantity,
                "quantity": product.quantity,
                "productId": product.productId,
                "summary": product.summary,
                "thumbnailUrl": product.thumbnailUrl,
                "productName": product.productName,
                "productHandle": product.productHandle,
                "price": product.price,
                "subtotalAmount": product.subtotalAmount,
                "totalAmount": product.totalAmount,
                "Title": product.Title

            };
            return newProduct;
        }),
        "shippingAddress": Address,
        "source": "web"
    })


    const placeOrderResponse = http.post(`${baseUrl}:3012/orders/v1/order-management/place-order?paymentRequired=${paymentRequired}`, placeOrderpayload, { headers });
    check(placeOrderResponse, {
        'place Order endpoint status is 201': (res) => {
            console.log(res.body);return res.status === 201
        }
    });

    const logoutResponse = http.post(`${baseUrl}/users/v1/public/logout`, JSON.stringify({}),{ headers});
    check(logoutResponse, {
        'Logout endpoint status is 201': (res) => {return res.status === 201}
    });
   
  sleep(1);
}
