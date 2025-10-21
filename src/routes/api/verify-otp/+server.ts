import {
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_VERIFY_SERVICE_SID
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import pkg from 'twilio';

const { Twilio } = pkg;

export async function POST({ request }) {
	try {
		const { phoneNumber, otp } = await request.json();

		if (!phoneNumber || !otp) {
			return json({ success: false, error: 'Phone number and OTP are required' }, { status: 400 });
		}

		const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

		const verification_check = await client.verify.v2
			.services(TWILIO_VERIFY_SERVICE_SID)
			.verificationChecks.create({
				to: phoneNumber,
				code: otp
			});

		return json({
			success: true,
			status: verification_check.status
		});
	} catch (error) {
		console.error('OTP verification error:', error);
		return json(
			{
				success: false,
				error: 'Failed to verify OTP'
			},
			{ status: 500 }
		);
	}
}
