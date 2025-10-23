// src/routes/api/payment/create-transfers/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

// Define your connected account IDs - replace with your actual account IDs
const CATEGORY_ACCOUNTS: Record<string, string> = {
	food: 'acct_food123',
	beverage: 'acct_beverage456',
	default: 'acct_default789'
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { paymentIntentId, orderId, categoryTotals } = await request.json();

		// Verify the payment intent was successful
		const paymentIntent = (await stripe.paymentIntents.retrieve(paymentIntentId, {
			expand: ['charges']
		})) as Stripe.PaymentIntent & {
			charges?: { data: Array<{ id: string }> };
		};

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
				// Get the charge ID from the expanded charges object
				const chargeId = paymentIntent.charges?.data?.[0]?.id;

				if (!chargeId) {
					throw new Error('No charge found for payment intent');
				}

				return stripe.transfers.create({
					amount: Math.round(Number(amount) * 100), // Convert to cents
					currency: 'inr',
					destination: accountId,
					source_transaction: chargeId,
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
				error: error instanceof Error ? error.message : 'Failed to create transfers'
			},
			{ status: 500 }
		);
	}
};
