import type { Status } from '@prisma/client';

// Define the cart item type
export type CartItem = {
	id: string;
	name: string;
	size: string;
	price: string;
	quantity: number;
	imageUrl: string;
	category: string; // Added category field
};

// Define order type based on Prisma schema
export type CreateOrderInput = {
	userId: string;
	products: {
		name: string;
		price: number;
		category: string; // Add category to products
		orderId?: string;
	}[];
	status: Status;
	categoryTotals?: Record<string, number>; // Add this to track category totals
};

export function createCartStore() {
	// Svelte 5 runes for cart state
	let cart = $state<CartItem[]>([]);

	// Initialize cart from localStorage if available
	if (typeof window !== 'undefined') {
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			try {
				// Process the saved cart data in a temporary variable
				const parsedCart = JSON.parse(savedCart);
				const processedCart = parsedCart.map((item: CartItem) => {
					if (!item.category) {
						return { ...item, category: 'default' };
					}
					return item;
				});
				
				// Assign to state variable once
				cart = processedCart;
			} catch (e) {
				console.error('Failed to parse cart from localStorage', e);
			}
		}
	}

	// Function to save cart to localStorage
	function saveCartToLocalStorage() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('cart', JSON.stringify(cart));
		}
	}

	// Function to add an item to the cart
	function addToCart(item: CartItem): void {
		const existingItemIndex = cart.findIndex(
			(cartItem) => cartItem.id === item.id && cartItem.size === item.size
		);

		if (existingItemIndex !== -1) {
			// If item already exists, increase quantity
			cart[existingItemIndex].quantity += item.quantity;
		} else {
			// Otherwise add new item
			cart = [...cart, item];
		}

		saveCartToLocalStorage();
	}

	// Function to remove an item from the cart
	function removeFromCart(itemId: string, size: string): void {
		cart = cart.filter((item) => !(item.id === itemId && item.size === size));
		saveCartToLocalStorage();
	}

	// Function to update item quantity
	function updateQuantity(itemId: string, size: string, quantity: number): void {
		if (quantity <= 0) {
			removeFromCart(itemId, size);
			return;
		}

		cart = cart.map((item) => {
			if (item.id === itemId && item.size === size) {
				return { ...item, quantity };
			}
			return item;
		});

		saveCartToLocalStorage();
	}

	// Function to clear the cart
	function clearCart(): void {
		cart = [];
		saveCartToLocalStorage();
	}

	// Get cart total
	function getCartTotal(): number {
		return cart.reduce((total, item) => {
			// Convert price from "₹40" to 40
			const priceValue = parseFloat(item.price.replace('₹', ''));
			return total + priceValue * item.quantity;
		}, 0);
	}

	// Get cart items count
	function getCartItemsCount(): number {
		return cart.reduce((count, item) => count + item.quantity, 0);
	}

	// Get totals by category
	function getTotalsByCategory(): Record<string, number> {
		const categoryTotals: Record<string, number> = {};

		cart.forEach((item) => {
			const category = item.category || 'default';
			const priceValue = parseFloat(item.price.replace('₹', ''));
			const itemTotal = priceValue * item.quantity;

			if (!categoryTotals[category]) {
				categoryTotals[category] = 0;
			}

			categoryTotals[category] += itemTotal;
		});

		return categoryTotals;
	}

	// Convert cart to order input format
	function cartToOrderInput(userId: string): CreateOrderInput {
		const categoryTotals = getTotalsByCategory();

		return {
			userId,
			products: cart.flatMap((item) => {
				// Convert price from "₹40" to 40
				const priceValue = parseFloat(item.price.replace('₹', ''));

				// Create product entries for each quantity
				return Array(item.quantity).fill({
					name: `${item.name} (${item.size})`,
					price: priceValue,
					category: item.category || 'snacks'
				});
			}),
			status: 'PENDING',
			categoryTotals
		};
	}

	// Return an object with cart state and methods
	return {
		// State
		get cart() {
			return cart;
		},

		// Methods
		addToCart,
		removeFromCart,
		updateQuantity,
		clearCart,
		getCartTotal,
		getCartItemsCount,
		getTotalsByCategory,
		cartToOrderInput
	};
}

// Create and export a single instance of the cart store
export const cartStore = createCartStore();
