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
			console.log('Sending OTP to:', phoneNumber);
			const response = await authClient.phoneNumber.sendOtp({
				phoneNumber: phoneNumber
			});

			console.log('OTP response:', response);
			otpSent = true;
			toast.success('OTP sent successfully! Check your phone.');
		} catch (err: any) {
			console.error('Failed to send OTP:', err);
			
			// Handle specific Twilio trial mode errors
			const errorMsg = err?.message || '';
			if (errorMsg.includes('trial') || errorMsg.includes('unverified') || errorMsg.includes('60200')) {
				error = '⚠️ Demo Mode: This app uses Twilio trial account. To receive OTP, your phone number must be verified in Twilio Console first. Please contact the administrator or try with a verified number.';
			} else {
				error = errorMsg || 'Failed to send OTP. Please check your phone number and try again.';
			}
			toast.error('Failed to send OTP');
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

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 p-4"
>
	<!-- Decorative Background Elements -->
	<div class="absolute inset-0 overflow-hidden">
		<div
			class="absolute -left-4 top-20 h-72 w-72 animate-pulse rounded-full bg-orange-200 opacity-20 blur-3xl"
		></div>
		<div
			class="absolute -right-4 bottom-20 h-72 w-72 animate-pulse rounded-full bg-red-200 opacity-20 blur-3xl"
			style="animation-delay: 1s;"
		></div>
		<div
			class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-yellow-200 opacity-10 blur-3xl"
			style="animation-delay: 2s;"
		></div>
	</div>

	<!-- Main Card -->
	<Card class="relative w-full max-w-md shadow-2xl backdrop-blur-sm">
		<!-- Brand Header -->
		<div class="absolute -top-12 left-1/2 -translate-x-1/2">
			<div
				class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-lg"
			>
				<PhoneIcon class="h-12 w-12 text-white" />
			</div>
		</div>

		<CardHeader class="space-y-3 pt-16 text-center">
			<CardTitle class="text-3xl font-bold tracking-tight">
				{#if verificationSuccess}
					<span class="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
						All Set! 🎉
					</span>
				{:else if otpSent}
					<span class="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
						Verify Your Number
					</span>
				{:else}
					<span class="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
						Welcome to FlavorSouth
					</span>
				{/if}
			</CardTitle>
			<CardDescription class="text-base text-gray-600">
				{#if verificationSuccess}
					Your phone number has been verified successfully!
				{:else if otpSent}
					Enter the 6-digit code sent to <strong class="text-gray-900">{phoneNumber}</strong>
				{:else}
					Sign in with your phone number to continue
				{/if}
			</CardDescription>
		</CardHeader>

		<CardContent class="space-y-6 px-6 pb-6">
			{#if verificationSuccess}
				<div class="flex flex-col items-center justify-center py-8">
					<div
						class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
					>
						<CheckCircle2 class="h-10 w-10 text-white" />
					</div>
					<p class="animate-pulse text-center text-lg font-medium text-gray-700">
						Redirecting to your dashboard...
					</p>
				</div>
			{:else if otpSent}
				<div class="space-y-6">
					<div class="flex flex-col items-center gap-6">
						<label for="otp" class="text-sm font-semibold text-gray-700">
							Enter Verification Code
						</label>
						<InputOTP.Root value={otp} onValueChange={handleOtpChange} maxlength={6}>
							{#snippet children({ cells })}
								<InputOTP.Group class="gap-2">
									{#each cells.slice(0, 3) as cell (cell)}
										<InputOTP.Slot
											{cell}
											class="h-14 w-12 rounded-lg border-2 border-gray-300 text-lg font-bold transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
										/>
									{/each}
								</InputOTP.Group>
								<div class="px-2">
									<div class="h-1 w-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400"></div>
								</div>
								<InputOTP.Group class="gap-2">
									{#each cells.slice(3, 6) as cell (cell)}
										<InputOTP.Slot
											{cell}
											class="h-14 w-12 rounded-lg border-2 border-gray-300 text-lg font-bold transition-all hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
										/>
									{/each}
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					</div>

					{#if error}
						<div
							class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
						>
							<div class="h-1.5 w-1.5 rounded-full bg-red-500"></div>
							{error}
						</div>
					{/if}

					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<p class="text-sm text-gray-600">
							Didn't receive the code?
							<button
								onclick={resetForm}
								disabled={isLoading}
								class="ml-1 font-semibold text-orange-600 transition-colors hover:text-orange-700 hover:underline focus:outline-none disabled:opacity-50"
							>
								Resend OTP
							</button>
						</p>
					</div>
				</div>
			{:else}
				<div class="space-y-5">
					<div class="space-y-3">
						<label for="phoneNumber" class="text-sm font-semibold text-gray-700">
							Phone Number
						</label>
						<div class="relative">
							<div
								class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500"
							>
								<PhoneIcon class="h-5 w-5" />
							</div>
							<Input
								type="tel"
								class="h-12 border-2 border-gray-300 pl-12 text-lg transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
								id="phoneNumber"
								autocomplete="off"
								inputmode="numeric"
								bind:value={phoneNumber}
								placeholder="+91 98765 43210"
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
						<p class="flex items-center gap-2 text-xs text-gray-500">
							<div class="h-1 w-1 rounded-full bg-gray-400"></div>
							Enter your Indian mobile number to receive OTP
						</p>
					</div>

					{#if error}
						<div
							class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
						>
							<div class="h-1.5 w-1.5 rounded-full bg-red-500"></div>
							{error}
						</div>
					{/if}

					<!-- Features Section -->
					<div class="space-y-2 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-4">
						<p class="text-xs font-semibold uppercase tracking-wide text-gray-600">Why Sign In?</p>
						<ul class="space-y-2 text-sm text-gray-700">
							<li class="flex items-start gap-2">
								<div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
								<span>Track your orders in real-time</span>
							</li>
							<li class="flex items-start gap-2">
								<div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
								<span>Save your favorite South Indian dishes</span>
							</li>
							<li class="flex items-start gap-2">
								<div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500"></div>
								<span>Get exclusive offers and deals</span>
							</li>
						</ul>
					</div>
				</div>
			{/if}
		</CardContent>

		<CardFooter class="flex justify-center px-6 pb-6">
			{#if !verificationSuccess}
				{#if otpSent}
					<Button
						class="h-12 w-full bg-gradient-to-r from-orange-500 to-red-600 text-base font-semibold shadow-lg transition-all hover:from-orange-600 hover:to-red-700 hover:shadow-xl disabled:opacity-50"
						onclick={handleVerifyOtp}
						disabled={isLoading || otp.length !== 6}
					>
						{#if isLoading}
							<Loader2 class="mr-2 h-5 w-5 animate-spin" />
							Verifying...
						{:else}
							Verify & Continue
						{/if}
					</Button>
				{:else}
					<Button
						onclick={handleSendOtp}
						disabled={isLoading || !phoneNumber}
						class="h-12 w-full bg-gradient-to-r from-orange-500 to-red-600 text-base font-semibold shadow-lg transition-all hover:from-orange-600 hover:to-red-700 hover:shadow-xl disabled:opacity-50"
					>
						{#if isLoading}
							<Loader2 class="mr-2 h-5 w-5 animate-spin" />
							Sending OTP...
						{:else}
							<PhoneIcon class="mr-2 h-5 w-5" />
							Send Verification Code
						{/if}
					</Button>
				{/if}
			{/if}
		</CardFooter>
	</Card>

	<!-- Footer Text -->
	<div class="absolute bottom-4 left-0 right-0 text-center">
		<p class="text-sm text-gray-600">
			Authentic South Indian Cuisine • Fast & Secure Checkout
		</p>
	</div>
</div>
