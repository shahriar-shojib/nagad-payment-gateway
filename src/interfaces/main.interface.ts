import { IClientType } from './headers.interface';

/**
 * Configuration Required by the NagadGateway Library
 */
export interface INagadConstructor {
	baseURL: string;
	merchantID: string;
	merchantNumber: string;
	privKey: string;
	callbackURL: string;
	apiVersion: string;
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
	 * Additional Details for product
	 * Accepts an object
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
