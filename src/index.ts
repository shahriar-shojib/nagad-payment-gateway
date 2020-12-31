import * as crypto from 'crypto';
import * as fs from 'fs';
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
		const { baseURL, callbackURL, merchantID, merchantNumber, privKey, apiVersion } = config;
		this.baseURL = baseURL;
		this.merchantID = merchantID;
		this.merchantNumber = merchantNumber;
		this.headers = {
			'X-KM-Api-Version': apiVersion,
		};
		this.callbackURL = callbackURL;
		const { privateKey, publicKey } = this.genKeys(fs.readFileSync(privKey, { encoding: 'utf-8' }));
		this.privKey = privateKey;
		this.pubKey = publicKey;
	}

	/**
	 * ## Initiate a Payment from nagad
	 *
	 * @param createPaymentConfig Arguments for payment creation
	 * @example
	 * ```javascript
	 * const paymentConfig: ICreatePaymentArgs = {
	 *   amount: '100',
	 *   ip: '10.10.0.10',
	 *   orderId: '12111243GD',
	 *   productDetails: { a: '1', b: '2' },
	 *   clientType: 'PC_WEB',
	 * };
	 * const paymentURL = await nagad .createPayment(paymentConfig);
	 * ```
	 * @returns {String} Payment URL for nagad
	 *
	 */
	async createPayment(createPaymentConfig: ICreatePaymentArgs): Promise<string> {
		const { amount, ip, orderId, productDetails, clientType } = createPaymentConfig;
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

		const newIP = ip === '::1' ? '103.100.200.100' : ip;
		console.log(payload);
		const response = await post<INagadCreatePaymentResponse>(endpoint, payload, {
			...this.headers,
			'X-KM-IP-V4': newIP,
			'X-KM-Client-Type': clientType,
		});
		console.log(response);
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
		return get<INagadPaymentVerificationResponse>(`${this.baseURL}/api/dfs/verify/payment/${paymentRefID}`, this.headers);
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
			.privateDecrypt({ key: this.privKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(data, 'base64'))
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

	private genKeys = (privKey: string): { publicKey: string; privateKey: string } => {
		const privateKey = /begin/i.test(privKey) ? privKey : `-----BEGIN PRIVATE KEY-----\n${privKey}\n-----END PRIVATE KEY-----`;
		const privateKeyObject = crypto.createPrivateKey({ key: privateKey, format: 'pem', type: 'pkcs8', passphrase: '' });
		const pubKeyObject = crypto.createPublicKey(privateKeyObject);

		const publicKey = pubKeyObject
			.export({
				format: 'pem',
				type: 'spki',
			})
			.toString();
		return { publicKey, privateKey: privateKeyObject.export({ format: 'pem', type: 'pkcs8' }).toString() };
	};
}

export = NagadGateway;
