// src/routes/api/payment/create-transfers/+server.ts
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Define your connected account IDs - replace with your actual account IDs
const CATEGORY_ACCOUNTS = {
	food: 'acct_food123',
	beverage: 'acct_beverage456',
	default: 'acct_default789'
};

export async function POST({ request }) {
	try {
		const { paymentIntentId, orderId, categoryTotals } = await request.json();

		// Verify the payment intent was successful
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.status !== 'succeeded') {
			return json(
				{
					success: false,
					error: 'Payment has not been completed'
				},
				{ status: 400 }
			);
		}

		// Create a transfer group for tracking
		const transferGroup = `order_${orderId}`;

		// Create transfers to each category account
		const transferPromises = Object.entries(categoryTotals).map(async ([category, amount]) => {
			const accountId = CATEGORY_ACCOUNTS[category] || CATEGORY_ACCOUNTS.default;

			if (accountId) {
				return stripe.transfers.create({
					amount: Math.round(Number(amount) * 100), // Convert to cents
					currency: 'inr',
					destination: accountId,
					source_transaction: paymentIntent.charges.data[0].id, // Use the charge ID from the payment
					transfer_group: transferGroup,
					metadata: {
						category,
						order_id: orderId
					}
				});
			}
		});

		await Promise.all(transferPromises);

		return json({ success: true });
	} catch (error) {
		console.error('Failed to create transfers:', error);
		return json(
			{
				success: false,
				error: error.message
			},
			{ status: 500 }
		);
	}
}
