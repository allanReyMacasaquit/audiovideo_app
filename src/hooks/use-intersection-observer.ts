import { useEffect, useState, useRef } from 'react';

type IntersectionObserverOptions = IntersectionObserverInit & {
	freezeOnceVisible?: boolean;
};

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
	options: IntersectionObserverOptions = {}
) {
	const targetRef = useRef<T>(null);
	const [isIntersecting, setIsIntersecting] = useState(false);

	useEffect(() => {
		const element = targetRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(([entry]) => {
			setIsIntersecting(entry.isIntersecting);
			if (entry.isIntersecting && options.freezeOnceVisible) {
				observer.disconnect();
			}
		}, options);

		observer.observe(element);

		return () => observer.disconnect();
	}, [options]);

	return { targetRef, isIntersecting };
}
