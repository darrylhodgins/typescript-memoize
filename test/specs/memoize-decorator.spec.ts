import { Memoize, MemoizeExpiring } from '../../src/memoize-decorator';
import exp = require('constants');

describe('Memoize()', () => {

	// Doing spies a little unusually because the decorator under test does things
	// to the originl methods below.  I figure it's better to be explicit here…
	let getNumberSpy = jasmine.createSpy('getNumberSpy');
	let valueSpy = jasmine.createSpy('valueSpy');
	let getGreetingSpy = jasmine.createSpy('getGreetingSpy');
	let multiplySpy = jasmine.createSpy('multiplySpy');

	let a: MyClass;
	let b: MyClass;

	beforeEach(() => {
		a = new MyClass();
	    b = new MyClass();

		getNumberSpy.calls.reset();
		valueSpy.calls.reset();
		getGreetingSpy.calls.reset();
		multiplySpy.calls.reset();
	});

	class MyClass {
		@Memoize()
		public getNumber(): number {
			getNumberSpy();
			return Math.random();
		}

		@Memoize()
		public get value(): number {
			//valueSpy();
			return Math.random();
		}

		@Memoize()
		public getGreeting(greeting: string, planet: string): string {
			getGreetingSpy.apply(this, arguments);
			return greeting + ', ' + planet;
		}

		@Memoize((a: number, b: number) => {
			return a + ';' + b;
		})
		public multiply(a: number, b: number) {
			multiplySpy.apply(this, arguments);
			return a * b;
		}

		@Memoize(true)
		public multiply2(a: number, b: number) {
			multiplySpy.apply(this, arguments);
			return a * b;
		}

		@Memoize(true)
		public getGreeting2(greeting: string, planet: string): string {
			getGreetingSpy.apply(this, arguments);
			return greeting + ', ' + planet;
		}
	}


	describe('when decorating a method', () => {
		it("method should be memoized", () => {
			expect(a.getNumber()).toEqual(a.getNumber());
	    });

		it("multiple instances shouldn't share values for methods", () => {
			expect(a.getNumber()).not.toEqual(b.getNumber());
	    });
	});

	describe('when decorating a get accessor', () => {
		it("accessor should be memoized", () => {
			expect(a.value).toEqual(a.value);
	    });

		it("multiple instances shouldn't share values for accessors", () => {
			expect(a.value).not.toEqual(b.value);
	    });
	});

	describe('when decorating a method, which takes some parameters', () => {
		it('should call the original method with the original arguments', () => {
			let val1 = a.getGreeting('Halló', 'heimur'); // In Icelandic
			expect(val1).toEqual('Halló, heimur');
			expect(getGreetingSpy).toHaveBeenCalledWith('Halló', 'heimur');
		});

		it('should call the original method once', () => {
			let val1 = a.getGreeting('Ciao', 'mondo'); // In Italian
			let val2 = a.getGreeting('Ciao', 'mondo');

			expect(val1).toEqual('Ciao, mondo');
			expect(val2).toEqual('Ciao, mondo');

			expect(getGreetingSpy).toHaveBeenCalledTimes(1);
		});

		it('should not share between two instances of the same class', () => {
			let val1 = a.getGreeting('Hej', 'världen'); // In Swedish
			let val2 = b.getGreeting('Hej', 'världen');

			expect(val1).toEqual('Hej, världen');
			expect(val2).toEqual('Hej, världen');

			expect(getGreetingSpy).toHaveBeenCalledTimes(2);
		})

		it('should call the original method once, even if the second parameter is different', () => {
			let val1 = a.getGreeting('Hola', 'Mundo'); // Spanish, even
			let val2 = a.getGreeting('Hola', 'Mars');

			expect(val1).toEqual('Hola, Mundo');
			expect(val2).toEqual('Hola, Mundo');

			expect(getGreetingSpy).toHaveBeenCalledTimes(1);
		});

		it('should call the original method once', () => {
			let val1 = a.getGreeting('Bonjour', 'le monde');
			let val2 = a.getGreeting('Hello', 'World');

			expect(val1).toEqual('Bonjour, le monde');
			expect(val2).toEqual('Hello, World');

			expect(getGreetingSpy).toHaveBeenCalledTimes(2);
		});
	});


	describe('when decorating a method using a hashFunction', () => {

		it('should call the original method with the original arguments', () => {
			let val1 = a.multiply(5, 7);
			expect(multiplySpy).toHaveBeenCalledWith(5, 7);
		});

		it('should only call the original method once', () => {
			let val1 = a.multiply(4, 6);
			let val2 = a.multiply(4, 6);
			expect(val1).toEqual(24);
			expect(val2).toEqual(24);
			expect(multiplySpy.calls.count()).toEqual(1);
		});

		it('should not simply memoize based on the first parameter', () => {
			let val1 = a.multiply(4, 7);
			let val2 = a.multiply(4, 9);
			expect(val1).toEqual(28);
			expect(val2).toEqual(36);
			expect(multiplySpy.calls.count()).toEqual(2);
		});
	});

	describe('when passgin true to memoize as a hashFunction', () => {
		it('should call the original method with the original arguments', () => {
			let val1 = a.multiply2(5, 7);
			expect(multiplySpy).toHaveBeenCalledWith(5, 7);
		});

		it('should only call the original method once', () => {
			let val1 = a.multiply2(4, 6);
			let val2 = a.multiply2(4, 6);
			expect(val1).toEqual(24);
			expect(val2).toEqual(24);
			expect(multiplySpy.calls.count()).toEqual(1);
		});


		it('should take into consideration every parameter', () => {
			let val1 = a.getGreeting2('Hello', 'World');
			let val2 = a.getGreeting2('Hello', 'Moon');

			expect(val1).toEqual('Hello, World');
			expect(val2).toEqual('Hello, Moon');

			expect(getGreetingSpy).toHaveBeenCalledTimes(2);
		});


	});


});


describe('MemoizeExpiring()', () => {

	let getNumberSpy = jasmine.createSpy('getNumberSpy');
	let valueSpy = jasmine.createSpy('valueSpy');

	let a: MyClass;
	let b: MyClass;

	beforeEach(() => {
		a = new MyClass();
		b = new MyClass();

		getNumberSpy.calls.reset();
		valueSpy.calls.reset();
	});

	class MyClass {
		@MemoizeExpiring(100)
		public getNumber(): number {
			getNumberSpy();
			return Math.random();
		}

		@MemoizeExpiring(100)
		public get value(): number {
			//valueSpy();
			return Math.random();
		}
	}


	describe('when decorating a method', () => {
		it("method should be memoized", () => {
			expect(a.getNumber()).toEqual(a.getNumber());
		});

		it("multiple instances shouldn't share values for methods", () => {
			expect(a.getNumber()).not.toEqual(b.getNumber());
		});

		it("should expire memoized values after 100ms", (done) => {
			let an0 = a.getNumber();
			setTimeout(() => {
				let an1 = a.getNumber();
				expect(an0).toEqual(an1);
			}, 20);
			setTimeout(() => {
				let an2 = a.getNumber();
				expect(an0).not.toEqual(an2);
				done();
			}, 100);
		});
	});

	describe('when decorating a get accessor', () => {
		it("accessor should be memoized", () => {
			expect(a.value).toEqual(a.value);
		});

		it("multiple instances shouldn't share values for accessors", () => {
			expect(a.value).not.toEqual(b.value);
		});
	});


});
