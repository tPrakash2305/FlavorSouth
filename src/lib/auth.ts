import {
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_VERIFY_SERVICE_SID
} from '$env/static/private';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { anonymous, phoneNumber } from 'better-auth/plugins';
import pkg from 'twilio';
import prisma from './prisma';

const { Twilio } = pkg;

export const auth = betterAuth({
	trustedOrigins: [PUBLIC_BETTER_AUTH_URL],
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	plugins: [
		phoneNumber({
			sendOTP: async ({ phoneNumber }) => {
				try {
					console.log('Attempting to send OTP to:', phoneNumber);
					console.log('Twilio Account SID:', TWILIO_ACCOUNT_SID ? 'Set' : 'Missing');
					console.log('Twilio Auth Token:', TWILIO_AUTH_TOKEN ? 'Set' : 'Missing');
					console.log('Twilio Verify Service SID:', TWILIO_VERIFY_SERVICE_SID ? 'Set' : 'Missing');

					const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

					const verification = await client.verify.v2
						.services(TWILIO_VERIFY_SERVICE_SID)
						.verifications.create({
							channel: 'sms',
							to: phoneNumber
						});

					console.log('OTP sent successfully:', verification.status);
					return verification;
				} catch (error) {
					console.error('Error sending OTP:', error);
					throw error;
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
