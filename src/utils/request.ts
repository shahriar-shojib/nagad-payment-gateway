import fetch from 'node-fetch';
import { NagadException } from '../exceptions/NagadException';
import { IHeaders } from '../interfaces/headers.interface';

interface IPayload {
	[key: string]: unknown;
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
	const data = await r.json();
	if (data.reason) {
		throw new NagadException(data.message);
	}
	return data;
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
	const data = await r.json();
	if (data.reason) {
		throw new NagadException(data.message);
	}
	return data;
}
