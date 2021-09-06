import NagadGateway from '../dist/index.js';
import { config } from 'dotenv';
config();

const nagad = new NagadGateway({
	apiVersion: 'v-0.2.0',
	baseURL: process.env.BASE_URL,
	callbackURL: process.env.CALLBACK_URL,
	merchantID: process.env.MERCHANT_ID,
	merchantNumber: process.env.MERCHANT_NUMBER,
	privKey: process.env.PRIVKEY,
	pubKey: process.env.PUBKEY,
	isPath: false,
});

const paymentConfig = {
	amount: '100',
	ip: '10.10.0.10',
	orderId: `${Date.now()}`,
	productDetails: { a: '1', b: '2' },
	clientType: 'PC_WEB',
};

(async () => {
	console.log('[Running Test #1]', 'Create and fetch nagad payment URL');
	const paymentURL = await nagad.createPayment(paymentConfig);
	/sandbox/.test(paymentURL);
	console.log('[Test Passed]', 'Was Able to create a payment request successfully');
	process.exit(0);
})().catch((err) => {
	console.log('[Test Failed]', err.name, err.message, 'Stack Trace:', err.stack);
	process.exit(1);
});
