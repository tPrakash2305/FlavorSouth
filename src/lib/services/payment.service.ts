export async function createPaymentIntent(params: {
	amount: number;
	orderId: string;
	categoryTotals: Record<string, number>;
}) {
	const response = await fetch('/api/payment/create-intent', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			amount: params.amount,
			orderId: params.orderId,
			categoryTotals: params.categoryTotals
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Payment intent creation failed');
	}

	return response.json();
}

export async function createTransfers(params: {
	paymentIntentId: string;
	orderId: string;
	categoryTotals: Record<string, number>;
}) {
	const response = await fetch('/api/payment/create-transfers', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			paymentIntentId: params.paymentIntentId,
			orderId: params.orderId,
			categoryTotals: params.categoryTotals
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Transfer creation failed');
	}

	return response.json();
}
