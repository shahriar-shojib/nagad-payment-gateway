# nagad-payment-gateway

[![Test Suite](https://github.com/shahriar-shojib/nagad-payment-gateway/actions/workflows/test.yml/badge.svg)](https://github.com/shahriar-shojib/nagad-payment-gateway/actions/workflows/test.yml)

Nodejs library to accept nagad payments on your backend application

## Features

-   Written in Typescript
-   No headaches when doing cryptographic operations, everything is handled inside the library.
-   Get Intellisense with vscode to avoid errors
-   Type definitions included, and all the documentation is provided as `TSDoc` comments

---

# How to use

## Installing the library

### `npm`

> `npm install nagad-payment-gateway`

### `yarn`

> `yarn add nagad-payment-gateway`

---

## Initializing the library

### `javascript`

> file `nagad.js`

```javascript
/* eslint-disable @typescript-eslint/no-var-requires */
const NagadGateway = require('nagad-payment-gateway');

const config = {
	apiVersion: 'v-0.2.0',
	baseURL: process.env.BASE_URL,
	callbackURL: process.env.CALLBACK_URL,
	merchantID: process.env.MERCHANT_ID,
	merchantNumber: process.env.MERCHANT_NUMBER,
	privKey: '.keys/private.key',
	pubKey: '.keys/public.key',
};
const nagad = new NagadGateway(config);

module.exports = nagad;
```

### `typescript`

> Todo

---

## Create a payment

```javascript
try {
	const nagadURL = nagad.createPayment({
		// -> get intellisense here
		amount: '100',
		ip: '10.10.0.10',
		orderId: `${Date.now()}`,
		productDetails: { a: '1', b: '2' },
		clientType: 'PC_WEB',
	});
	//redirect user to the nagad url
} catch (err) {
	console.log(err);
}
```

> More documentation coming soon

---

### Contributing

-   Please Follow the code style and use the prettier config and eslint config provided in the repository
-   Feel free to open `issues` or `pull request` for any issues and bugfixes
-   If you want to implement new features or write documentation about existing features feel free to do it as well
-   To see a list of missing features or to-do's, please visit the `project` section of the github repository

---

### License

> MIT

> DISCLAIMER: This software comes with absolutely no warranty and is not affiliated with the company **`Bkash`** in any way. Use at your own risk. Author and Contributors are not responsible for any financial damages, outages etc.

### Author

[Shahriar Shojib](https://github.com/shahriar-shojib)
