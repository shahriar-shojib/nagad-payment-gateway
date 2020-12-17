import crypto from 'crypto';
import { post, get } from './utils/request';
import { IHeaders } from './interfaces/headers.interface';

import {
	IConfirmPaymentArgs,
	ICreatePaymentArgs,
	INagadConstructor,
	INagadCreatePaymentBody,
	INagadSensitiveData,
} from './interfaces/main.interface';

import {
	INagadCreatePaymentDecryptedResponse,
	INagadCreatePaymentResponse,
	INagadPaymentURL,
	INagadPaymentVerificationResponse,
} from './interfaces/nagadResponse.interface';

class NagadGateway {
	private readonly baseURL: string;
	private readonly merchantID: string;
	private readonly merchantNumber: string;
	private readonly pubKey: string;
	private readonly privKey: string;
	private readonly headers: IHeaders;
	private readonly callbackURL: string;
	constructor(config: INagadConstructor) {
		const { baseURL, callbackURL, merchantID, merchantNumber, privKey, pubKey, apiVersion } = config;
		this.baseURL = baseURL;
		this.merchantID = merchantID;
		this.merchantNumber = merchantNumber;
		this.pubKey = pubKey;
		this.privKey = privKey;
		this.headers = {
			'X-KM-Api-Version': apiVersion,
		};
		this.callbackURL = callbackURL;
	}

	async createPayment(createPaymentConfig: ICreatePaymentArgs): Promise<string> {
		const { amount, ip, orderId, productDetails } = createPaymentConfig;
		const endpoint = `${this.baseURL}/remote-payment-gateway-1.0/api/dfs/check-out/initialize/${this.merchantID}/${orderId}`;
		const timestamp = this.date();

		const sensitive: INagadSensitiveData = {
			merchantId: this.merchantID,
			datetime: timestamp,
			orderId,
			challenge: this.createHash(orderId),
		};

		const signature = this.sign(sensitive);

		const payload: INagadCreatePaymentBody = {
			accountNumber: this.merchantNumber,
			dateTime: timestamp,
			sensitiveData: this.encrypt(sensitive),
			signature,
		};

		const newIP = ip === '::1' ? '118.179.174.202' : ip;
		const response = await post<INagadCreatePaymentResponse>(endpoint, payload, {
			...this.headers,
			'X-KM-IP-V4': newIP,
		});

		const decrypted = this.decrypt<INagadCreatePaymentDecryptedResponse>(response.sensitiveData);
		const { paymentReferenceId, challenge } = decrypted;
		const confirmArgs: IConfirmPaymentArgs = {
			paymentReferenceId,
			challenge,
			orderId,
			amount,
			productDetails,
			ip: newIP,
		};

		const { callBackUrl } = await this.confirmPayment(confirmArgs);
		return callBackUrl;
	}

	handleCallBack = (): void => {
		//todo
	};

	verifyPayment = (paymentRefID: string): Promise<INagadPaymentVerificationResponse> => {
		return get<INagadPaymentVerificationResponse>(
			`${this.baseURL}/api/dfs/verify/payment/${paymentRefID}`,
			this.headers
		);
	};

	private confirmPayment = async (data: IConfirmPaymentArgs): Promise<INagadPaymentURL> => {
		const { amount, challenge, ip, orderId, paymentReferenceId, productDetails } = data;
		const sensitiveData = {
			merchantId: this.merchantID,
			orderId,
			amount,
			currencyCode: '050',
			challenge,
		};
		const payload = {
			paymentRefId: paymentReferenceId,
			sensitiveData: this.encrypt(sensitiveData),
			signature: this.sign(sensitiveData),
			merchantCallbackURL: this.callbackURL,
			additionalMerchantInfo: {
				...productDetails,
			},
		};
		const newIP = ip === '::1' || ip === '127.0.0.1' ? '103.100.102.100' : ip;
		return (await post)<INagadPaymentURL>(
			`${this.baseURL}/remote-payment-gateway-1.0/api/dfs/check-out/complete/${paymentReferenceId}`,
			payload,
			{
				...this.headers,
				'X-KM-IP-V4': newIP,
			}
		);
	};

	private encrypt = <T>(data: T): string => {
		const signerObject = crypto.publicEncrypt(
			{ key: this.pubKey, padding: crypto.constants.RSA_PKCS1_PADDING },
			Buffer.from(JSON.stringify(data))
		);
		return signerObject.toString('base64');
	};

	private decrypt = <T>(data: string): T => {
		const decrtypted = crypto
			.privateDecrypt(
				{ key: this.privKey, padding: crypto.constants.RSA_PKCS1_PADDING },
				Buffer.from(data, 'base64')
			)
			.toString();
		return JSON.parse(decrtypted);
	};
	private sign = (data: string | Record<string, string>): string => {
		const signerObject = crypto.createSign('SHA256');
		signerObject.update(JSON.stringify(data));
		signerObject.end();
		const signed = signerObject.sign(this.privKey, 'base64');
		return signed;
	};
	private date = (): string => {
		const now = new Date(Date.now());
		const day = `${now.getDate()}`.length === 1 ? `0${now.getDate()}` : `${now.getDate()}`;
		const hour = `${now.getHours()}`.length === 1 ? `0${now.getHours()}` : `${now.getHours()}`;
		const minute = `${now.getMinutes()}`.length === 1 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;
		const second = `${now.getSeconds()}`.length === 1 ? `0${now.getSeconds()}` : `${now.getSeconds()}`;
		return `${now.getFullYear()}${now.getMonth() + 1}${day}${hour}${minute}${second}`;
	};
	private createHash = (string: string): string => {
		return crypto.createHash('sha1').update(string).digest('hex').toUpperCase();
	};
}

// const privKey = fs.readFileSync('./src/.keys/sandbox_private.key', { encoding: 'utf8' });
// const pubKey = fs.readFileSync('./src/.keys/sandbox_public.pem', { encoding: 'utf8' });

// const nagad = new Nagad('http://sandbox.mynagad.com:10080', '683002007104225', '01961900400', pubKey, privKey);
// // nagad
// // 	.createPayment(`${`${Math.random()}`.replace('0.', '')}`)
// // 	.then(console.log)
// // 	.catch(console.log);
// // // console.log(nagad.date());

exports = NagadGateway;
