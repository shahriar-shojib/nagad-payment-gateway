import { IClientType } from './headers.interface';

/**
 * Configuration Required by the NagadGateway Library
 */
export interface INagadConstructor {
	/**
	 * ### Nagad API BaseURL
	 * @example
	 * ```
	 * const baseURL = 'http://sandbox.mynagad.com/remote-payment-gateway'; //no trailing slash
	 * ```
	 *
	 */
	baseURL: string;
	merchantID: string;
	merchantNumber: string;
	/**
	 * ### Path to merchant private Key `The keys that you will generate`
	 * @example
	 * ```
	 * const privKeyPath = '.keys/privKey.pem';
	 * ```
	 *
	 */
	privKey: string;

	/**
	 * ### Path to nagad's public key `It's Provided by nagad`
	 * @example
	 * ```
	 * const privKeyPath = '.keys/pubKey.pem';
	 * ```
	 *
	 */
	pubKey: string;
	/**
	 * @example
	 * ```
	 * const myCallBackURL = 'https://yoursite.com/payment_redirect_handler';
	 * ```
	 */
	callbackURL: string;

	apiVersion: string;
	isPath: boolean;
}

export interface INagadCreatePaymentBody extends Record<string, string> {
	accountNumber: string;
	dateTime: string;
	sensitiveData: string;
	signature: string;
}

/**
 * ### Nagad Sensitive Data
 */
export interface INagadSensitiveData extends Record<string, string> {
	/** Merchant ID */
	merchantId: string;
	datetime: string;
	orderId: string;
	challenge: string;
}

export interface IConfirmPaymentArgs {
	paymentReferenceId: string;
	challenge: string;
	orderId: string;
	amount: string;
	productDetails: Record<string, string>;
	ip: string;
}
/**
 * ### Nagad Payment Creation Argument lists
 * ### Required Properties:
 * - orderID `string`
 * - amount `string`
 * - productDetails `object`
 * - ip `string`
 * - clientType `enum`
 */

export interface ICreatePaymentArgs {
	/**
	 * `Merchant Order ID`
	 */
	orderId: string;
	/**
	 * `Amount in String` **BDT**
	 */
	amount: string;
	/**
	 * ### Additional Details for product
	 * `Accepts an object`
	 */
	productDetails: Record<string, string>;
	/**
	 * **Client IP ADDRESS**
	 */
	ip: string;
	/**
	 * ### Client Type
	 * **Possible Values**:
	 * - `'PC_WEB'`
	 * - `'MOBILE_WEB'`
	 * - `'MOBILE_APP'`
	 * - `'WALLET_WEB_VIEW'`
	 * - `'BILL_KEY'`
	 */
	clientType: IClientType;
}
