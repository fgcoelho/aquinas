export class AquinasError extends Error {
	constructor(message: string, originalError?: Error | string) {
		const originalErrorMessage = originalError
			? typeof originalError === "string"
				? originalError
				: originalError.message
			: 'no additional info';

		const finalMessage = originalErrorMessage
			? `${message} - ${originalErrorMessage}`
			: message;

		super(finalMessage);

		this.name = "AquinasError";
	}
}
