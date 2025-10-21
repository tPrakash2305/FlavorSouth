import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { products: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return json({ 
      success: false, 
      error: 'Failed to fetch orders'
    }, { status: 500 });
  }
}