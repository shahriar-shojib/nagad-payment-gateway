export class NagadException extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NagadException';
		this.stack = this.stack ?? new Error().stack;
	}
}
