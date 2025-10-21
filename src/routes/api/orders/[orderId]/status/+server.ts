import { json } from '@sveltejs/kit';
import * as orderService from '$lib/services/orderService';
import type { RequestHandler } from './$types';
import type { Status } from '@prisma/client';
import { auth } from '$lib/auth';

// Define type for request body
type OrderStatusRequest = {
  status: Status;
};

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    // Check if user is authenticated and authorized
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 403 });
    }

    const { orderId } = params;
    const data = await request.json() as OrderStatusRequest;
    const { status } = data;

    // Validate the input
    if (!orderId || !status) {
      return json({ 
        success: false, 
        message: 'Order ID and status are required' 
      }, { status: 400 });
    }

    // Check if status is valid
    if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return json({ 
        success: false, 
        message: 'Invalid status' 
      }, { status: 400 });
    }

    // Update the order status
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
    
    return json({ 
      success: true, 
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return json({ 
      success: false, 
      message: 'Failed to update order status' 
    }, { status: 500 });
  }
}