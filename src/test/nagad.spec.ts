/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { config } from 'dotenv';
import { NagadGateway } from '..';
config();

const nagad = new NagadGateway({
	apiVersion: 'v-0.2.0',
	baseURL: process.env.BASE_URL!,
	callbackURL: process.env.CALLBACK_URL!,
	merchantID: process.env.MERCHANT_ID!,
	merchantNumber: process.env.MERCHANT_NUMBER!,
	privKey: process.env.PRIVKEY!,
	pubKey: process.env.PUBKEY!,
});

describe('Nagad Gateway', () => {
	it('should create a payment', async () => {
		const paymentURL = await nagad.createPayment({
			amount: '100',
			ip: '10.10.0.10',
			orderId: `${Date.now()}`,
			productDetails: { a: '1', b: '2' },
			clientType: 'PC_WEB',
		});
		console.log(paymentURL);
	});
});
