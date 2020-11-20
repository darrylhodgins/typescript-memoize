export function Memoize(autoHashOrHashFn?: boolean | ((...args: any[]) => any)) {
	return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {

		if (descriptor.value != null) {
			descriptor.value = getNewFunction(descriptor.value, autoHashOrHashFn);
		} else if (descriptor.get != null) {
			descriptor.get = getNewFunction(descriptor.get, autoHashOrHashFn);
		} else {
			throw 'Only put a Memoize() decorator on a method or get accessor.';
		}


	};
}

let counter = 0;
function getNewFunction(originalMethod: () => void, autoHashOrHashFn?: boolean | ((...args: any[]) => any)) {
	const identifier = ++counter;

	// The function returned here gets called instead of originalMethod.
	return function (...args: any[]) {
		const propValName = `__memoized_value_${identifier}`;
		const propMapName = `__memoized_map_${identifier}`;

		let returnedValue: any;

		if (autoHashOrHashFn || args.length > 0) {

			// Get or create map
			if (!this.hasOwnProperty(propMapName)) {
				Object.defineProperty(this, propMapName, {
					configurable: false,
					enumerable: false,
					writable: false,
					value: new Map<any, any>()
				});
			}
			let myMap: Map<any, any> = this[propMapName];

			let hashKey: any;

			// If true is passed as first parameter, will automatically use every argument, passed to string
			if (autoHashOrHashFn === true) {
				hashKey = args.map(a => a.toString()).join('!');
			} else if (autoHashOrHashFn) {
				hashKey = autoHashOrHashFn.apply(this, args);
			} else {
				hashKey = args[0];
			}

			if (myMap.has(hashKey)) {
				returnedValue = myMap.get(hashKey);
			} else {
				returnedValue = originalMethod.apply(this, args);
				myMap.set(hashKey, returnedValue);
			}

		} else {

			if (this.hasOwnProperty(propValName)) {
				returnedValue = this[propValName];
			} else {
				returnedValue = originalMethod.apply(this, args);
				Object.defineProperty(this, propValName, {
					configurable: false,
					enumerable: false,
					writable: false,
					value: returnedValue
				});
			}
		}

		return returnedValue;
	};
}
