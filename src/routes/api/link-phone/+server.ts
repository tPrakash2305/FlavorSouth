import prisma from '$lib/prisma';

export async function POST({ request }) {
	const { phoneNumber, userId } = await request.json();

	await prisma.user.update({
		where: { id: userId },
		data: { phoneNumber, phoneNumberVerified: true }
	});

	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
