import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		// Set a timeout to update debouncedValue after the specified delay
		const timeoutId = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Clear the timeout if the value or delay changes before the timeout completes
		return () => {
			clearTimeout(timeoutId);
		};
	}, [value, delay]);

	return debouncedValue;
};
