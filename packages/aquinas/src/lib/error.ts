export class AquinasError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AquinasError";
	}
}
