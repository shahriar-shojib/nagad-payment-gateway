export interface IHeaders {
	'X-KM-Api-Version': string;
	'X-KM-Client-Type'?: IClientType;
	'X-KM-IP-V4'?: string;
}

export type IClientType = 'PC_WEB' | 'MOBILE_WEB' | 'MOBILE_APP' | 'WALLET_WEB_VIEW' | 'BILL_KEY';
