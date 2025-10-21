<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Toaster } from '$lib/components/ui/sonner';

	const unprotectedRoutes = ['/', '/auth'];

	let { children } = $props();
	let session = authClient.useSession();

	$effect(() => {
		if ($session.isPending || $session.isRefetching) return;
		if (!unprotectedRoutes.includes(page.url.pathname) && !$session.data) {
			toast.error('You need to be logged in to access this page.');
			goto('/auth');
		}
	});
</script>

<Toaster />
{@render children()}
