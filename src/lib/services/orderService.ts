import prisma from '$lib/prisma';
import type { CreateOrderInput } from '$lib/stores/cart.svelte';

/**
 * Creates a new order in the database
 */
export async function createOrder(orderData: CreateOrderInput) {
  try {
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
    return await prisma.order.findUnique({
      where: { id: order.id },
      include: { products: true }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Gets all orders for a user
 */
export async function getUserOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: { products: true },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Gets all orders with user information
 */
export async function getAllOrders() {
  return await prisma.order.findMany({
    include: { 
      products: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Updates the status of an order
 */
export async function updateOrderStatus(orderId: string, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') {
  return await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
}