import * as crypto from 'crypto';
import * as fs from 'fs';
import { IClientType, IHeaders } from './interfaces/headers.interface';
import { get, post } from './utils/request';

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

export class NagadGateway {
	private readonly baseURL: string;
	private readonly merchantID: string;
	private readonly merchantNumber: string;
	private readonly pubKey: string;
	private readonly privKey: string;
	private readonly headers: IHeaders;
	private readonly callbackURL: string;

	constructor(config: INagadConstructor) {
		const { baseURL, callbackURL, merchantID, merchantNumber, privKey, pubKey, apiVersion, isPath } = config;
		this.baseURL = baseURL;
		this.merchantID = merchantID;
		this.merchantNumber = merchantNumber;
		this.headers = {
			'X-KM-Api-Version': apiVersion,
		};
		this.callbackURL = callbackURL;
		const { privateKey, publicKey } = this.genKeys(privKey, pubKey, isPath);
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
	 * @returns `Payment URL for nagad`
	 *
	 */
	async createPayment(createPaymentConfig: ICreatePaymentArgs): Promise<string> {
		const { amount, ip, orderId, productDetails, clientType } = createPaymentConfig;
		const endpoint = `${this.baseURL}/api/dfs/check-out/initialize/${this.merchantID}/${orderId}`;
		const timestamp = this.getTimeStamp();

		const sensitive: INagadSensitiveData = {
			merchantId: this.merchantID,
			datetime: timestamp,
			orderId,
			challenge: this.createHash(orderId),
		};

		const payload: INagadCreatePaymentBody = {
			accountNumber: this.merchantNumber,
			dateTime: timestamp,
			sensitiveData: this.encrypt(sensitive),
			signature: this.sign(sensitive),
		};

		const newIP = ip === '::1' || ip === '127.0.0.1' ? '103.100.200.100' : ip;

		const { sensitiveData } = await post<INagadCreatePaymentResponse>(endpoint, payload, {
			...this.headers,
			'X-KM-IP-V4': newIP,
			'X-KM-Client-Type': clientType,
		});

		const decrypted = this.decrypt<INagadCreatePaymentDecryptedResponse>(sensitiveData);
		const { paymentReferenceId, challenge } = decrypted;
		const confirmArgs: IConfirmPaymentArgs = {
			paymentReferenceId,
			challenge,
			orderId,
			amount,
			productDetails,
			ip: newIP,
		};

		const { callBackUrl } = await this.confirmPayment(confirmArgs, clientType);
		return callBackUrl;
	}

	async verifyPayment(paymentRefID: string): Promise<INagadPaymentVerificationResponse> {
		return await get<INagadPaymentVerificationResponse>(
			`${this.baseURL}/api/dfs/verify/payment/${paymentRefID}`,
			this.headers
		);
	}

	private confirmPayment = async (data: IConfirmPaymentArgs, clientType: IClientType): Promise<INagadPaymentURL> => {
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
		return await post<INagadPaymentURL>(`${this.baseURL}/api/dfs/check-out/complete/${paymentReferenceId}`, payload, {
			...this.headers,
			'X-KM-IP-V4': newIP,
			'X-KM-Client-Type': clientType,
		});
	};

	private encrypt<T>(data: T): string {
		const signerObject = crypto.publicEncrypt(
			{ key: this.pubKey, padding: crypto.constants.RSA_PKCS1_PADDING },
			Buffer.from(JSON.stringify(data))
		);
		return signerObject.toString('base64');
	}

	private decrypt<T>(data: string): T {
		const decrypted = crypto
			.privateDecrypt({ key: this.privKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(data, 'base64'))
			.toString();
		return JSON.parse(decrypted);
	}

	private sign(data: string | Record<string, string>) {
		const signerObject = crypto.createSign('SHA256');
		signerObject.update(JSON.stringify(data));
		signerObject.end();
		return signerObject.sign(this.privKey, 'base64');
	}

	private getTimeStamp() {
		const now = new Date();
		const timezoneOffset = now.getTimezoneOffset();
		now.setMinutes(now.getMinutes() - (timezoneOffset + 360)); // TimeZone UTC+6 Correction
		const day = now.getDate().toString().padStart(2, '0');
		const hour = now.getHours().toString().padStart(2, '0');
		const minute = now.getMinutes().toString().padStart(2, '0');
		const second = now.getSeconds().toString().padStart(2, '0');
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const year = now.getFullYear().toString();
		return `${year}${month}${day}${hour}${minute}${second}`;
	}

	private createHash(string: string): string {
		return crypto.createHash('sha1').update(string).digest('hex').toUpperCase();
	}

	private genKeys(privKeyPath: string, pubKeyPath: string, isPath: boolean): { publicKey: string; privateKey: string } {
		if (!isPath) {
			return {
				privateKey: this.formatKey(privKeyPath, 'PRIVATE'),
				publicKey: this.formatKey(pubKeyPath, 'PUBLIC'),
			};
		}

		const fsPrivKey = fs.readFileSync(privKeyPath, { encoding: 'utf-8' });
		const fsPubKey = fs.readFileSync(pubKeyPath, { encoding: 'utf-8' });
		return { publicKey: this.formatKey(fsPubKey, 'PUBLIC'), privateKey: this.formatKey(fsPrivKey, 'PRIVATE') };
	}

	private formatKey(key: string, type: 'PUBLIC' | 'PRIVATE') {
		return /begin/i.test(key) ? key.trim() : `-----BEGIN ${type} KEY-----\n${key.trim()}\n-----END ${type} KEY-----`;
	}
}

export default NagadGateway;
