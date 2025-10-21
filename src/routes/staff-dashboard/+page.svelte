<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Search, RefreshCw } from 'lucide-svelte';
	import type { Order, Product, User, Status } from '@prisma/client';
	import { toast } from 'svelte-sonner';

	// Define extended types with relationships included
	type OrderWithRelations = Order & {
		products: Product[];
		user?: Pick<User, 'id' | 'name' | 'email'> | null;
	};

	// State variables
	let allOrders = $state<OrderWithRelations[]>([]);
	let filteredOrders = $state<OrderWithRelations[]>([]);
	let isLoading = $state(true);
	let statusFilter = $state<'all' | Status>('all');
	let searchQuery = $state('');

	// Order details modal state
	let selectedOrder = $state<OrderWithRelations | null>(null);
	let showModal = $state(false);
	let isUpdating = $state(false);
	let newStatus = $state<Status>('PENDING');

	// Fetch all orders on component mount
	onMount(async () => {
		await fetchAllOrders();
	});

	// Fetch all orders from the API
	async function fetchAllOrders() {
		isLoading = true;
		try {
			const response = await fetch('/api/orders/all');
			const data = await response.json();

			if (data.success) {
				allOrders = data.orders;
				applyFilters(); // Initialize filtered orders
			} else {
				toast.error('Failed to load orders');
			}
		} catch (error) {
			console.error('Error fetching orders:', error);
			toast.error('Error loading orders. Please try again.');
		} finally {
			isLoading = false;
		}
	}

	// Apply filters to the orders list
	function applyFilters() {
		filteredOrders = allOrders.filter((order) => {
			// Status filter
			if (statusFilter !== 'all' && order.status !== statusFilter) {
				return false;
			}

			// Search filter (case insensitive search in ID, customer name, etc.)
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					order.id.toLowerCase().includes(query) ||
					(order.user?.name && order.user.name.toLowerCase().includes(query))
				);
			}

			return true;
		});
	}

	// Group products by name/price for display
	type GroupedProduct = Product & { quantity: number };
	function groupProducts(products: Product[]): Record<string, GroupedProduct> {
		return products.reduce((acc: Record<string, GroupedProduct>, product) => {
			const key = `${product.name}-${product.price}`;
			if (!acc[key]) {
				acc[key] = { ...product, quantity: 1 };
			} else {
				acc[key].quantity += 1;
			}
			return acc;
		}, {});
	}

	// Calculate order total
	function calculateTotal(products: Product[]): number {
		return products.reduce((acc, curr) => acc + curr.price, 0);
	}

	// Open order details modal
	function handleViewDetails(order: OrderWithRelations) {
		selectedOrder = order;
		newStatus = order.status;
		showModal = true;
	}

	// Update order status
	async function updateOrderStatus() {
		if (!selectedOrder || isUpdating) return;

		isUpdating = true;
		try {
			const response = await fetch(`/api/orders/${selectedOrder.id}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: newStatus })
			});

			const data = await response.json();

			if (data.success) {
				// Update local order status
				selectedOrder.status = newStatus;

				// Update in the original arrays
				const orderIndex = allOrders.findIndex((o) => o.id === selectedOrder?.id);
				if (orderIndex >= 0) {
					allOrders[orderIndex].status = newStatus;
				}

				applyFilters();
				toast.success(`Order status updated to ${newStatus}`);
				showModal = false;
			} else {
				toast.error(data.message || 'Failed to update order status');
			}
		} catch (error) {
			console.error('Error updating order status:', error);
			toast.error('An error occurred while updating the order');
		} finally {
			isUpdating = false;
		}
	}

	// Get CSS class for status badge
	function getStatusBadgeClass(status: Status): string {
		switch (status) {
			case 'PENDING':
				return 'bg-yellow-500 hover:bg-yellow-600';
			case 'COMPLETED':
				return 'bg-green-500 hover:bg-green-600';
			case 'CANCELLED':
				return 'bg-red-500 hover:bg-red-600';
			default:
				return 'bg-gray-500 hover:bg-gray-600';
		}
	}

	// Format date for display
	function formatDate(dateString: Date | string): string {
		return new Date(dateString).toLocaleString();
	}
</script>

<div class="container mx-auto space-y-6 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Staff Dashboard</h1>
		<Button variant="outline" onclick={fetchAllOrders} class="flex items-center gap-2">
			<RefreshCw class="h-4 w-4" />
			<span>Refresh</span>
		</Button>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Order Management</CardTitle>
			<CardDescription>View and manage all customer orders</CardDescription>
		</CardHeader>
		<CardContent>
			<!-- Filters and Search -->
			<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
				<div class="grid gap-2">
					<Label for="status-filter">Status Filter</Label>
					<Select
						type="single"
						value={statusFilter}
						onValueChange={(value) => {
							statusFilter = value as Status | 'all';
							applyFilters();
						}}
					>
						<SelectTrigger class="w-[180px]">
							{statusFilter ?? 'Select status'}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Orders</SelectItem>
							<SelectItem value="PENDING">Pending</SelectItem>
							<SelectItem value="COMPLETED">Completed</SelectItem>
							<SelectItem value="CANCELLED">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div class="relative flex-grow">
					<Label for="search-orders">Search Orders</Label>
					<div class="relative">
						<Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							id="search-orders"
							placeholder="Search by order ID or customer name"
							class="pl-8"
							value={searchQuery}
							oninput={(e) => {
								searchQuery = e.currentTarget.value;
								applyFilters();
							}}
						/>
					</div>
				</div>
			</div>

			<!-- Orders Table -->
			{#if isLoading}
				<div class="py-8 text-center">Loading orders...</div>
			{:else if filteredOrders.length === 0}
				<div class="py-8 text-center text-muted-foreground">
					No orders found matching your filters.
				</div>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Order ID</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Items</TableHead>
								<TableHead>Total</TableHead>
								<TableHead>Status</TableHead>
								<TableHead class="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each filteredOrders as order}
								<TableRow>
									<TableCell>#{order.id.slice(0, 8)}</TableCell>
									<TableCell>{formatDate(order.createdAt)}</TableCell>
									<TableCell>{order.user?.name || 'Unknown'}</TableCell>
									<TableCell class="max-w-[200px] truncate">
										{order.products.map((p) => p.name).join(', ')}
									</TableCell>
									<TableCell>₹{calculateTotal(order.products)}</TableCell>
									<TableCell>
										<Badge class={getStatusBadgeClass(order.status)}>
											{order.status}
										</Badge>
									</TableCell>
									<TableCell class="text-right">
										<Button variant="outline" size="sm" onclick={() => handleViewDetails(order)}>
											View Details
										</Button>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Order Details Modal -->
	<Dialog open={showModal} onOpenChange={(open) => (showModal = open)}>
		{#if selectedOrder}
			<DialogContent class="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Order #{selectedOrder.id.slice(0, 8)}</DialogTitle>
					<DialogDescription>
						Placed on {formatDate(selectedOrder.createdAt)}
					</DialogDescription>
				</DialogHeader>

				<div class="grid gap-4 py-4">
					<!-- Customer Information -->
					<div class="space-y-2">
						<h4 class="font-medium">Customer Information</h4>
						<p class="text-sm">
							Name: {selectedOrder.user?.name || 'Not available'}
						</p>
						<p class="text-sm">
							Email: {selectedOrder.user?.email || 'Not available'}
						</p>
					</div>

					<Separator />

					<!-- Order Items -->
					<div class="space-y-2">
						<h4 class="font-medium">Order Items</h4>
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
								<span>₹{calculateTotal(selectedOrder.products)}</span>
							</div>
						</div>
					</div>

					<Separator />

					<!-- Order Status Update -->
					<div class="space-y-2">
						<h4 class="font-medium">Update Order Status</h4>
						<Select
							type="single"
							value={newStatus}
							onValueChange={(value) => {
								newStatus = value as Status;
							}}
						>
							<SelectTrigger>
								{newStatus ?? 'Select status'}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="PENDING">Pending</SelectItem>
								<SelectItem value="COMPLETED">Completed</SelectItem>
								<SelectItem value="CANCELLED">Cancelled</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onclick={() => (showModal = false)}>Cancel</Button>
					<Button
						onclick={updateOrderStatus}
						disabled={isUpdating || newStatus === selectedOrder.status}
					>
						{isUpdating ? 'Updating...' : 'Update Status'}
					</Button>
				</DialogFooter>
			</DialogContent>
		{/if}
	</Dialog>
</div>
