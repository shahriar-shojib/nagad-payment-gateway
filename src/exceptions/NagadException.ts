export class NagadException extends Error {
	constructor(message: string, public reason?: string) {
		super(reason);
		this.name = 'NagadException';
		this.stack = this.stack ?? new Error().stack;
	}
}
