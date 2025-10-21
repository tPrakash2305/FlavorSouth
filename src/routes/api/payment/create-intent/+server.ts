import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST({ request }) {
	try {
		const { orderId, amount, categoryTotals } = await request.json();

		// Create a unique transfer group for this order
		const transferGroup = `order_${orderId}`;

		// Create a payment intent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to cents
			currency: 'inr',
			transfer_group: transferGroup,
			metadata: {
				order_id: orderId,
				category_totals: JSON.stringify(categoryTotals)
			}
		});

		return json({
			clientSecret: paymentIntent.client_secret,
			transferGroup
		});
	} catch (error) {
		console.error('Failed to create payment intent:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		return json({ error: errorMessage }, { status: 500 });
	}
}
