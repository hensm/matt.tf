function crypto_base(len, type = Uint8ClampedArray) {
	if (!("crypto" in window)) {
		throw new Error("Web Crypto API unavailable");
	}

	type = new type(len);
	if (!ArrayBuffer.isView(type)) {
		throw new Error("Argument `type` not typed array");
	}

	return window.crypto.getRandomValues(type);
}

function crypto_random() {
	return crypto_base(1)[0] / 255;
}

function crypto_between(min, max) {
	return Math.floor(crypto_random() * (max - (min))) + min;
}