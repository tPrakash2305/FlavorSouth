import { MSG91_AUTH_KEY, MSG91_TEMPLATE_ID } from '$env/static/private';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { anonymous, phoneNumber } from 'better-auth/plugins';
import axios from 'axios';
import prisma from './prisma';

export const auth = betterAuth({
	trustedOrigins: [PUBLIC_BETTER_AUTH_URL],
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	plugins: [
		phoneNumber({
			sendOTP: async ({ phoneNumber }) => {
				try {
					console.log('Sending OTP via MSG91 to:', phoneNumber);
					console.log('MSG91 Auth Key:', MSG91_AUTH_KEY ? 'Set' : 'Missing');
					console.log('MSG91 Template ID:', MSG91_TEMPLATE_ID ? 'Set' : 'Missing');

					// MSG91 Send OTP API
					const response = await axios.post(
						'https://control.msg91.com/api/v5/otp',
						{
							template_id: MSG91_TEMPLATE_ID,
							mobile: phoneNumber.replace('+', ''), // Remove + prefix
							authkey: MSG91_AUTH_KEY
						},
						{
							headers: {
								'Content-Type': 'application/json',
								authkey: MSG91_AUTH_KEY
							}
						}
					);

					console.log('MSG91 OTP sent successfully:', response.data);
					return response.data;
				} catch (error: any) {
					console.error('MSG91 Error:', error.response?.data || error.message);
					throw new Error(error.response?.data?.message || 'Failed to send OTP');
				}
			},
			signUpOnVerification: {
				getTempName: (phoneNumber) => {
					return phoneNumber;
				},
				getTempEmail: (phoneNumber) => {
					return `${phoneNumber}@ammasidli.in`;
				}
			}
		}),
		anonymous()
	]
});
