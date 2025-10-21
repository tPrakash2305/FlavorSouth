<script lang="ts">
	import {
		Card,
		CardTitle,
		CardHeader,
		CardFooter,
		CardContent,
		CardDescription
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as InputOTP from '$lib/components/ui/input-otp';
	import { Loader2, CheckCircle2, PhoneIcon } from 'lucide-svelte';

	let otp = $state('');
	let error = $state('');
	let otpSent = $state(false);
	let isLoading = $state(false);
	let phoneNumber = $state('+91');
	let verificationSuccess = $state(false);

	// Validate Indian phone number format
	function isValidPhoneNumber(phone: string): boolean {
		const phoneRegex = /^\+91[6-9]\d{9}$/;
		return phoneRegex.test(phone);
	}

	// Handle OTP send request
	async function handleSendOtp() {
		if (!isValidPhoneNumber(phoneNumber)) {
			error = 'Please enter a valid Indian phone number (e.g., +919876543210)';
			return;
		}

		error = '';
		isLoading = true;

		try {
			await authClient.phoneNumber.sendOtp({
				phoneNumber: phoneNumber
			});

			otpSent = true;
			toast('OTP Sent!');
		} catch (err) {
			error = 'Failed to send OTP. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Handle OTP verification
	async function handleVerifyOtp() {
		if (otp.length !== 6) {
			error = 'Please enter a valid 6-digit OTP';
			return;
		}

		error = '';
		isLoading = true;

		try {
			const response = await fetch('/api/verify-otp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					phoneNumber,
					otp
				})
			});

			const data = await response.json();

			if (data.success && data.status === 'approved') {
				verificationSuccess = true;
				toast('Verification Successful!');

				const response = await authClient.signIn.anonymous();
				if (response.data) {
					const fetchResponse = await fetch('/api/link-phone', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							phoneNumber,
							userId: response.data.user.id
						})
					});
					if (fetchResponse.status === 200) {
						toast('Phone number linked successfully!');
					} else {
						error = 'Failed to link phone number. Please try again.';
					}
					goto('/dashboard');
				} else {
					error = 'Failed to sign in. Please try again.';
				}
			} else {
				error = 'Invalid OTP. Please try again.';
			}
		} catch (err) {
			error = 'Verification failed. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}

	// Handle OTP input change
	function handleOtpChange(value: string) {
		otp = value;
		error = '';

		// Auto-verify if OTP is complete
		if (value.length === 6) {
			handleVerifyOtp();
		}
	}

	// Reset the form to request another OTP
	function resetForm() {
		otp = '';
		otpSent = false;
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-4">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle class="text-center text-2xl font-bold">
				{#if verificationSuccess}
					Verification Complete
				{:else if otpSent}
					Enter Verification Code
				{:else}
					Phone Verification
				{/if}
			</CardTitle>
			<CardDescription class="text-center">
				{#if verificationSuccess}
					Your phone number has been verified successfully!
				{:else if otpSent}
					We've sent a 6-digit code to {phoneNumber}
				{:else}
					Enter your phone number to receive a verification code
				{/if}
			</CardDescription>
		</CardHeader>

		<CardContent>
			{#if verificationSuccess}
				<div class="flex flex-col items-center justify-center py-6">
					<CheckCircle2 class="mb-4 h-16 w-16 text-green-500" />
					<p class="text-center text-primary">You will be redirected shortly...</p>
				</div>
			{:else if otpSent}
				<div class="space-y-4">
					<div class="flex flex-col items-center gap-4">
						<label for="otp" class="text-sm font-medium text-primary">Verification Code</label>
						<InputOTP.Root value={otp} onValueChange={handleOtpChange} maxlength={6}>
							{#snippet children({ cells })}
								<InputOTP.Group>
									{#each cells.slice(0, 3) as cell (cell)}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
								<InputOTP.Separator />
								<InputOTP.Group>
									{#each cells.slice(3, 6) as cell (cell)}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					</div>

					{#if error}
						<p class="text-center text-sm text-red-500">{error}</p>
					{/if}

					<div class="mt-2 text-center text-sm text-gray-500">
						Didn't receive the code?
						<button
							onclick={resetForm}
							disabled={isLoading}
							class="text-blue-600 hover:underline focus:outline-none"
						>
							Try again
						</button>
					</div>
				</div>
			{:else}
				<div class="space-y-4">
					<div class="space-y-2">
						<label for="phoneNumber" class="text-sm font-medium text-primary">Phone Number</label>
						<div class="relative">
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<PhoneIcon class="h-4 w-4 text-gray-400" />
							</div>
							<Input
								type="tel"
								class="pl-10"
								id="phoneNumber"
								autocomplete="off"
								inputmode="numeric"
								bind:value={phoneNumber}
								placeholder="+919876543210"
								oninput={(e) => {
									let val = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '');

									if (val.startsWith('91')) {
										phoneNumber = `+${val.slice(0, 12)}`;
									} else {
										phoneNumber = '+91' + val.slice(0, 10);
									}
								}}
							/>
						</div>
						<p class="text-xs text-gray-500">
							Enter your phone number in Indian format (e.g., +919876543210)
						</p>
					</div>

					{#if error}
						<p class="text-sm text-red-500">{error}</p>
					{/if}
				</div>
			{/if}
		</CardContent>

		<CardFooter class="flex justify-center">
			{#if !verificationSuccess}
				{#if otpSent}
					<Button class="w-full" onclick={handleVerifyOtp} disabled={isLoading || otp.length !== 6}>
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Verifying...
						{:else}
							Verify
						{/if}
					</Button>
				{:else}
					<Button onclick={handleSendOtp} disabled={isLoading || !phoneNumber} class="w-full">
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Sending...
						{:else}
							Send Verification Code
						{/if}
					</Button>
				{/if}
			{/if}
		</CardFooter>
	</Card>
</div>
