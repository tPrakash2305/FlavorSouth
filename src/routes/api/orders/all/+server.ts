import { auth } from '$lib/auth';
import * as orderService from '$lib/services/orderService';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	try {
		// Check if user is authenticated and authorized
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user) {
			return json(
				{
					success: false,
					message: 'Unauthorized'
				},
				{ status: 403 }
			);
		}

		const orders = await orderService.getAllOrders();
		return json({
			success: true,
			orders
		});
	} catch (error) {
		console.error('Error fetching all orders:', error);
		return json(
			{
				success: false,
				message: 'Failed to fetch orders'
			},
			{ status: 500 }
		);
	}
};
