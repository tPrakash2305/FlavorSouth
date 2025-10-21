<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { CheckCircle } from 'lucide-svelte';

	const orderId = $page.url.searchParams.get('order_id');

	function goToDashboard() {
		goto('/dashboard');
	}
</script>

<div class="container mx-auto px-4 py-8">
	<Card>
		<CardHeader>
			<div class="mb-4 flex justify-center">
				<CheckCircle class="h-16 w-16 text-green-500" />
			</div>
			<CardTitle class="text-center text-2xl">Payment Successful!</CardTitle>
		</CardHeader>
		<CardContent class="text-center">
			<p>Your order #{orderId} has been placed successfully.</p>
			<p class="mt-2">We've sent you an email with order details.</p>
		</CardContent>
		<CardFooter class="flex justify-center">
			<Button onclick={goToDashboard}>Go to Dashboard</Button>
		</CardFooter>
	</Card>
</div>
