<script lang="ts">
	import { goto, pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { authClient } from '$lib/auth-client';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { cartStore } from '$lib/stores/cart.svelte';
	import type { Prisma } from '@prisma/client';
	import { Plus, ShoppingCart } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	// Define types
	type Variant = {
		size: string;
		price: string;
	};

	type MenuItem = {
		id: string;
		name: string;
		description: string;
		variants: Variant[];
		image: string;
		category?: string;
	};

	type Product = {
		id: string;
		name: string;
		price: number;
		quantity?: number;
	};

	type Order = Prisma.OrderGetPayload<{ include: { products: true } }>;

	// Extract methods from cart store
	const { addToCart, getCartItemsCount } = cartStore;

	// State with proper types
	let activeTab = $state<string>($page.url.searchParams.get('tab') || 'orders');
	let userOrders = $state<Order[]>([]);
	let isLoading = $state(false);
	let selectedOrder = $state<Order | null>(null);
	let showModal = $state(false);
	let session = authClient.useSession();

	// Menu items with proper typing
	const menuItems: MenuItem[] = [
		{
			id: 'idli',
			name: 'Idli',
			description: 'Soft steamed rice cakes',
			variants: [
				{ size: '2 pcs', price: '₹40' },
				{ size: '4 pcs', price: '₹70' },
				{ size: '6 pcs', price: '₹100' }
			],
			image: 'https://placehold.co/300x200?text=Idli'
		},
		{
			id: 'coffee',
			name: 'Coffee',
			description: 'South Indian filter coffee',
			variants: [
				{ size: 'Small', price: '₹20' },
				{ size: 'Regular', price: '₹30' },
				{ size: 'Large', price: '₹40' }
			],
			image: 'https://placehold.co/300x200?text=Coffee'
		},
		{
			id: 'tea',
			name: 'Tea',
			description: 'Classic Indian masala chai',
			variants: [
				{ size: 'Small', price: '₹15' },
				{ size: 'Regular', price: '₹25' },
				{ size: 'Large', price: '₹35' }
			],
			image: 'https://placehold.co/300x200?text=Tea'
		}
	];

	const selectedVariants = $state<Record<string, string>>({});

	function handleTabChange(tab: string): void {
		const url = new URL(window.location.href);
		url.searchParams.set('tab', tab);
		pushState(url.toString(), {});
		activeTab = tab;

		// If switching to orders tab, fetch orders
		if (tab === 'orders' || tab === 'history') {
			fetchUserOrders();
		}
	}

	async function fetchUserOrders(): Promise<void> {
		if (!$session.data?.user) return;

		isLoading = true;
		try {
			const response = await fetch(`/api/orders/user?userId=${$session.data.user.id}`);
			const data = await response.json();

			if (data.success) {
				userOrders = data.orders;
			} else {
				toast.error('Failed to load orders');
			}
		} catch (error) {
			console.error('Error fetching orders:', error);
			toast.error('Failed to load orders');
		} finally {
			isLoading = false;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'preparing':
			case 'PENDING':
				return 'bg-yellow-500 hover:bg-yellow-600';
			case 'ready':
			case 'COMPLETED':
				return 'bg-green-500 hover:bg-green-600';
			case 'CANCELLED':
				return 'bg-red-500 hover:bg-red-600';
			default:
				return 'bg-gray-500 hover:bg-gray-600';
		}
	}

	function handleAddToCart(item: MenuItem): void {
		const selectedSize = selectedVariants[item.id] || item.variants[0].size;
		const selectedVariant = item.variants.find((v) => v.size === selectedSize);

		if (!selectedVariant) {
			toast.error('Please select a size');
			return;
		}

		addToCart({
			id: item.id,
			name: item.name,
			size: selectedVariant.size,
			price: selectedVariant.price,
			quantity: 1,
			imageUrl: item.image,
			category: item.category || 'snacks'  
		});

		toast.success(`Added ${item.name} (${selectedVariant.size}) to cart`);
	}

	function groupProducts(products: Product[]): Record<string, Product & { quantity: number }> {
		return products.reduce((acc, product) => {
			const key = `${product.name}-${product.price}`;
			if (!acc[key]) {
				acc[key] = { ...product, quantity: 1 };
			} else {
				acc[key].quantity! += 1;
			}
			return acc;
		}, {} as Record<string, Product & { quantity: number }>);
	}

	function handleViewDetails(order: Order): void {
		selectedOrder = order;
		showModal = true;
	}

	// Load orders on mount
	onMount(() => {
		if (activeTab === 'orders' || activeTab === 'history') {
			fetchUserOrders();
		}
	});
</script>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Amma Idli House Dashboard</h1>
		<Button variant="outline" class="flex items-center gap-2" onclick={() => goto('/cart')}>
			<ShoppingCart class="h-4 w-4" />
			<span>Cart ({getCartItemsCount()})</span>
		</Button>
	</div>

	<Tabs value={activeTab} onValueChange={handleTabChange} class="w-full">
		<TabsList class="grid w-full max-w-md grid-cols-3">
			<TabsTrigger value="orders">Current Orders</TabsTrigger>
			<TabsTrigger value="history">Order History</TabsTrigger>
			<TabsTrigger value="menu">Menu</TabsTrigger>
		</TabsList>

		<TabsContent value="orders" class="mt-6 space-y-4">
			<div class="text-2xl font-semibold">Current Orders</div>

			{#if isLoading}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center">Loading orders...</p>
					</CardContent>
				</Card>
			{:else if userOrders.filter((order) => order.status === 'PENDING').length > 0}
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each userOrders.filter((order) => order.status === 'PENDING') as order}
						<Card>
							<CardHeader>
								<CardTitle class="flex justify-between">
									<span>Order #{order.id.slice(0, 8)}</span>
									<Badge class={getStatusColor(order.status)}>{order.status}</Badge>
								</CardTitle>
								<CardDescription>{new Date(order.createdAt).toLocaleString()}</CardDescription>
							</CardHeader>
							<CardContent>
								<ul class="list-disc pl-5">
									{#each Object.values(groupProducts(order.products)) as product}
										<li>
											{product.name} x{product.quantity} (₹{product.price * product.quantity})
										</li>
									{/each}
								</ul>
							</CardContent>
							<CardFooter class="flex justify-between">
								<span class="font-semibold">
									Total: ₹{order.products.reduce((acc: number, curr) => acc + curr.price, 0)}
								</span>
								<Button variant="outline" onclick={() => handleViewDetails(order)}>
									View Details
								</Button>
							</CardFooter>
						</Card>
					{/each}
				</div>
			{:else}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center text-muted-foreground">No current orders</p>
					</CardContent>
				</Card>
			{/if}

			<!-- Order Details Modal -->
			<Dialog open={showModal} onOpenChange={(open) => (showModal = open)}>
				{#if selectedOrder}
					<DialogContent class="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Order Details #{selectedOrder.id.slice(0, 8)}</DialogTitle>
						</DialogHeader>
						<div class="grid gap-4 py-4">
							<div class="space-y-2">
								<h4 class="font-medium">Order Information</h4>
								<p class="text-sm text-muted-foreground">
									Created: {new Date(selectedOrder.createdAt).toLocaleString()}
								</p>
								<p class="text-sm text-muted-foreground">
									Status: <Badge variant="secondary">{selectedOrder.status}</Badge>
								</p>
							</div>
							
							<div class="space-y-2">
								<h4 class="font-medium">Items</h4>
								<div class="rounded-md border p-4">
									{#each Object.values(groupProducts(selectedOrder.products)) as product}
										<div class="flex justify-between py-1">
											<span>{product.name} x{product.quantity}</span>
											<span>₹{product.price * product.quantity}</span>
										</div>
										{#if product !== Object.values(groupProducts(selectedOrder.products)).slice(-1)[0]}
											<Separator class="my-2" />
										{/if}
									{/each}
									<Separator class="my-2" />
									<div class="flex justify-between font-medium">
										<span>Total</span>
										<span>₹{selectedOrder.products.reduce((acc, curr) => acc + curr.price, 0)}</span>
									</div>
								</div>
							</div>
						</div>
					</DialogContent>
				{/if}
			</Dialog>
		</TabsContent>

		<TabsContent value="history" class="mt-6">
			<div class="mb-4 text-2xl font-semibold">Order History</div>

			{#if isLoading}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center">Loading order history...</p>
					</CardContent>
				</Card>
			{:else if userOrders.filter((order) => order.status !== 'PENDING').length > 0}
				<div class="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order ID</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Items</TableHead>
								<TableHead>Total</TableHead>
								<TableHead>Status</TableHead>
								<TableHead class="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each userOrders.filter((order) => order.status !== 'PENDING') as order}
								<TableRow>
									<TableCell>#{order.id.slice(0, 8)}</TableCell>
									<TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
									<TableCell>
										{order.products.map((p) => p.name).join(', ')}
									</TableCell>
									<TableCell>
										₹{order.products.reduce((acc: number, curr) => acc + curr.price, 0)}
									</TableCell>
									<TableCell>
										<Badge variant="secondary">{order.status}</Badge>
									</TableCell>
									<TableCell class="text-right">
										<Button variant="ghost" size="sm">Reorder</Button>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{:else}
				<Card>
					<CardContent class="pt-6">
						<p class="text-center text-muted-foreground">No order history found</p>
					</CardContent>
				</Card>
			{/if}
		</TabsContent>

		<TabsContent value="menu" class="mt-6">
			<div class="mb-4 text-2xl font-semibold">Menu</div>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each menuItems as item}
					<Card>
						<img src={item.image} alt={item.name} class="h-48 w-full rounded-t-lg object-cover" />
						<CardHeader>
							<CardTitle>{item.name}</CardTitle>
							<CardDescription>{item.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div class="space-y-2">
								{#each item.variants as variant}
									<div class="flex justify-between">
										<span>{variant.size}</span>
										<span class="font-semibold">{variant.price}</span>
									</div>
									{#if variant !== item.variants[item.variants.length - 1]}
										<Separator />
									{/if}
								{/each}
							</div>
						</CardContent>
						<CardFooter class="flex flex-col gap-2">
							<div class="flex w-full items-center">
								<Select
									type="single"
									value={selectedVariants[item.id] || item.variants[0].size}
									onValueChange={(value) => (selectedVariants[item.id] = value)}
								>
									<SelectTrigger class="w-full">
										{selectedVariants[item.id] || item.variants[0].size}
									</SelectTrigger>
									<SelectContent>
										{#each item.variants as variant}
											<SelectItem value={variant.size}>
												{variant.size} - {variant.price}
											</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>
							<Button class="w-full" onclick={() => handleAddToCart(item)}>
								<Plus class="mr-2 h-4 w-4" /> Add to Cart
							</Button>
						</CardFooter>
					</Card>
				{/each}
			</div>
		</TabsContent>
	</Tabs>
</div>
