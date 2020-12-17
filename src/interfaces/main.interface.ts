export interface INagadConstructor {
	baseURL: string;
	merchantID: string;
	merchantNumber: string;
	pubKey: string;
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

export interface INagadSensitiveData extends Record<string, string> {
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

export interface ICreatePaymentArgs {
	orderId: string;
	amount: string;
	productDetails: Record<string, string>;
	ip: string;
}
