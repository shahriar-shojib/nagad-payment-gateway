export interface INagadCreatePaymentResponse {
	sensitiveData: string;
	signature: string;
}

export interface INagadCreatePaymentDecryptedResponse {
	paymentReferenceId: string;
	acceptDateTime: string;
	challenge: string;
}

export interface INagadPaymentURL {
	callBackUrl: string;
}

export interface INagadPaymentVerificationResponse {
	merchantId: string;
	orderId: string;
	paymentRefId: string;
	amount: string;
	clientMobileNo: string | null;
	merchantMobileNo: string;
	orderDateTime: string | null;
	issuerPaymentDateTime: string;
	issuerPaymentRefNo: string;
	additionalMerchantInfo: string | null;
	status: string;
	statusCode: string;
}
