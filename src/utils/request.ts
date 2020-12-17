import fetch from 'node-fetch';

import { IHeaders } from '../interfaces/headers.interface';

interface IPayload {
	[key: string]: unknown;
}

export function get<T>(url: string, additionalHeaders: IHeaders): Promise<T> {
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
	}).then((r) => r.json());
}

export function post<T>(url: string, payload: IPayload = {}, additionalHeaders: IHeaders): Promise<T> {
	return fetch(url, {
		headers: {
			'content-type': 'application/json',
			Accept: 'application/json',
			...additionalHeaders,
		},
		body: JSON.stringify(payload),
		method: 'POST',
	}).then((r) => r.json());
}
