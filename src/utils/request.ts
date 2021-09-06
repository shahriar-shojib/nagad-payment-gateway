import fetch from 'node-fetch';
import { NagadException } from '../exceptions/NagadException.js';
import { IHeaders } from '../interfaces/headers.interface';

interface IPayload {
	[key: string]: unknown;
}

interface BaseResponseNagad {
	reason?: string;
	message: string;
}

export async function get<T>(url: string, additionalHeaders: IHeaders): Promise<T> {
	const r = await fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
	});
	const data = (await r.json()) as BaseResponseNagad;
	if (data.reason) {
		throw new NagadException(data.message);
	}
	return (data as unknown) as T;
}

export async function post<T>(url: string, payload: IPayload = {}, additionalHeaders: IHeaders): Promise<T> {
	const r = await fetch(url, {
		headers: {
			'content-type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
		body: JSON.stringify(payload),
		method: 'POST',
	});
	const data = (await r.json()) as BaseResponseNagad;
	if (data.reason) {
		throw new NagadException(data.message);
	}
	return (data as unknown) as T;
}
