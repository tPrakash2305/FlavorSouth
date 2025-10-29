import { MSG91_AUTH_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import axios from 'axios';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { phoneNumber, otp } = await request.json();

		if (!phoneNumber || !otp) {
			return json({ success: false, error: 'Phone number and OTP are required' }, { status: 400 });
		}

		// MSG91 Verify OTP API
		const response = await axios.post(
			'https://control.msg91.com/api/v5/otp/verify',
			{
				otp: otp,
				mobile: phoneNumber.replace('+', '') // Remove + prefix
			},
			{
				headers: {
					'Content-Type': 'application/json',
					authkey: MSG91_AUTH_KEY
				}
			}
		);

		console.log('MSG91 Verify Response:', response.data);

		// MSG91 returns type: 'success' when OTP is valid
		if (response.data.type === 'success') {
			return json({
				success: true,
				status: 'approved'
			});
		} else {
			return json({
				success: false,
				error: response.data.message || 'Invalid OTP'
			});
		}
	} catch (error: any) {
		console.error('OTP verification error:', error.response?.data || error.message);
		return json(
			{
				success: false,
				error: error.response?.data?.message || 'Failed to verify OTP'
			},
			{ status: 500 }
		);
	}
}
