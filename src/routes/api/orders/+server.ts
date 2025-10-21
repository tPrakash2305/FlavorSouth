import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma';
import type { CreateOrderInput } from '$lib/stores/cart.svelte';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const orderData: CreateOrderInput = await request.json();
    
    // Validate request data
    if (!orderData.userId || !orderData.products || !orderData.status) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create the order first
    const order = await prisma.order.create({
      data: {
        userId: orderData.userId,
        status: orderData.status
      }
    });

    // Then create all products with the order ID
    const productsWithOrderId = orderData.products.map(product => ({
      ...product,
      orderId: order.id
    }));

    // Insert all products in a transaction
    await prisma.product.createMany({
      data: productsWithOrderId
    });

    // Return the created order with products
    const createdOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { products: true }
    });

    return json({ 
      success: true, 
      order: createdOrder 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return json({ 
      success: false, 
      error: 'Failed to create order'
    }, { status: 500 });
  }
}