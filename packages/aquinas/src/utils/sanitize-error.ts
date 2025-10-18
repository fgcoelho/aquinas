export const sanitizeErrorMessage = (error: unknown): string => {
	const errMsg =
		error instanceof Error
			? error.message
			: typeof error === "string"
				? error
				: JSON.stringify(error);

	return errMsg;
};
