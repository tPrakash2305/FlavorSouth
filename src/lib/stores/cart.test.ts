import { describe, it, expect } from 'vitest';
import type { CartItem } from './cart.svelte';

/**
 * Helper function to calculate cart total
 * Extracted for testing purposes
 */
export function calculateCartTotal(cart: CartItem[]): number {
	return cart.reduce((total, item) => {
		const priceValue = parseFloat(item.price.replace('₹', ''));
		return total + priceValue * item.quantity;
	}, 0);
}

/**
 * Helper function to calculate category totals
 * Extracted for testing purposes
 */
export function calculateCategoryTotals(cart: CartItem[]): Record<string, number> {
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

describe('Cart Utilities', () => {
	describe('calculateCartTotal', () => {
		it('should calculate total for empty cart', () => {
			expect(calculateCartTotal([])).toBe(0);
		});

		it('should calculate total for single item', () => {
			const cart: CartItem[] = [
				{
					id: '1',
					name: 'Idli',
					size: 'Regular',
					price: '₹40',
					quantity: 2,
					imageUrl: '',
					category: 'breakfast'
				}
			];
			expect(calculateCartTotal(cart)).toBe(80);
		});

		it('should calculate total for multiple items', () => {
			const cart: CartItem[] = [
				{
					id: '1',
					name: 'Idli',
					size: 'Regular',
					price: '₹40',
					quantity: 2,
					imageUrl: '',
					category: 'breakfast'
				},
				{
					id: '2',
					name: 'Dosa',
					size: 'Large',
					price: '₹60',
					quantity: 1,
					imageUrl: '',
					category: 'breakfast'
				}
			];
			expect(calculateCartTotal(cart)).toBe(140);
		});

		it('should handle decimal prices', () => {
			const cart: CartItem[] = [
				{
					id: '1',
					name: 'Coffee',
					size: 'Regular',
					price: '₹45.50',
					quantity: 2,
					imageUrl: '',
					category: 'beverages'
				}
			];
			expect(calculateCartTotal(cart)).toBe(91);
		});
	});

	describe('calculateCategoryTotals', () => {
		it('should return empty object for empty cart', () => {
			expect(calculateCategoryTotals([])).toEqual({});
		});

		it('should calculate totals for single category', () => {
			const cart: CartItem[] = [
				{
					id: '1',
					name: 'Idli',
					size: 'Regular',
					price: '₹40',
					quantity: 2,
					imageUrl: '',
					category: 'breakfast'
				},
				{
					id: '2',
					name: 'Dosa',
					size: 'Regular',
					price: '₹50',
					quantity: 1,
					imageUrl: '',
					category: 'breakfast'
				}
			];
			expect(calculateCategoryTotals(cart)).toEqual({
				breakfast: 130
			});
		});

		it('should calculate totals for multiple categories', () => {
			const cart: CartItem[] = [
				{
					id: '1',
					name: 'Idli',
					size: 'Regular',
					price: '₹40',
					quantity: 2,
					imageUrl: '',
					category: 'breakfast'
				},
				{
					id: '2',
					name: 'Coffee',
					size: 'Regular',
					price: '₹30',
					quantity: 1,
					imageUrl: '',
					category: 'beverages'
				},
				{
					id: '3',
					name: 'Vada',
					size: 'Regular',
					price: '₹25',
					quantity: 3,
					imageUrl: '',
					category: 'snacks'
				}
			];
			expect(calculateCategoryTotals(cart)).toEqual({
				breakfast: 80,
				beverages: 30,
				snacks: 75
			});
		});

		it('should use "default" category when category is missing', () => {
			const cart: CartItem[] = [
				{
					id: '1',
					name: 'Mystery Item',
					size: 'Regular',
					price: '₹100',
					quantity: 1,
					imageUrl: '',
					category: ''
				}
			];
			const result = calculateCategoryTotals(cart);
			expect(result.default).toBe(100);
		});
	});
});
