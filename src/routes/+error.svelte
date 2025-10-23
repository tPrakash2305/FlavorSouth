<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { AlertCircle, Home, RefreshCw } from 'lucide-svelte';

	function handleReload() {
		window.location.reload();
	}

	function goHome() {
		window.location.href = '/';
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<div class="mb-4 flex justify-center">
				<AlertCircle class="h-16 w-16 text-destructive" />
			</div>
			<CardTitle class="text-2xl">Oops! Something went wrong</CardTitle>
			<CardDescription class="text-base">
				{#if $page.error}
					{$page.error.message || 'An unexpected error occurred'}
				{:else}
					An unexpected error occurred
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="rounded-lg bg-muted p-4">
				<p class="text-sm text-muted-foreground">
					We're sorry for the inconvenience. This error has been logged and we'll look into it.
				</p>
			</div>

			<div class="flex flex-col gap-2 sm:flex-row">
				<Button on:click={handleReload} variant="default" class="flex-1">
					<RefreshCw class="mr-2 h-4 w-4" />
					Reload Page
				</Button>
				<Button on:click={goHome} variant="outline" class="flex-1">
					<Home class="mr-2 h-4 w-4" />
					Go Home
				</Button>
			</div>

			{#if import.meta.env.DEV && $page.error}
				<details class="rounded-lg border border-border bg-muted/50 p-4">
					<summary class="cursor-pointer text-sm font-medium">Developer Details</summary>
					<pre class="mt-2 overflow-x-auto text-xs">{JSON.stringify($page.error, null, 2)}</pre>
				</details>
			{/if}
		</CardContent>
	</Card>
</div>
