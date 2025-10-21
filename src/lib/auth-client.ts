import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { anonymousClient, phoneNumberClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	plugins: [phoneNumberClient(), anonymousClient()],
	baseURL: PUBLIC_BETTER_AUTH_URL
});

export const { signIn, signUp, signOut, useSession } = authClient;
