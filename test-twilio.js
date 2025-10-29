// Test script to verify Twilio configuration
import dotenv from 'dotenv';
import pkg from 'twilio';

dotenv.config();

const { Twilio } = pkg;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('Testing Twilio Configuration...');
console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'Missing');
console.log('Auth Token:', authToken ? 'Set (hidden)' : 'Missing');
console.log('Verify Service SID:', verifySid ? `${verifySid.substring(0, 10)}...` : 'Missing');

if (!accountSid || !authToken || !verifySid) {
	console.error('❌ Missing Twilio credentials in .env file');
	process.exit(1);
}

const client = new Twilio(accountSid, authToken);

// Test 1: Check account status
console.log('\n📞 Testing Twilio Account...');
try {
	const account = await client.api.accounts(accountSid).fetch();
	console.log('✅ Account Status:', account.status);
	console.log('   Type:', account.type);
	console.log('   Friendly Name:', account.friendlyName);
} catch (error) {
	console.error('❌ Account Error:', error.message);
}

// Test 2: Check verify service
console.log('\n🔐 Testing Verify Service...');
try {
	const service = await client.verify.v2.services(verifySid).fetch();
	console.log('✅ Service Status:', service.status);
	console.log('   Friendly Name:', service.friendlyName);
	console.log('   Code Length:', service.codeLength);
} catch (error) {
	console.error('❌ Verify Service Error:', error.message);
}

// Test 3: Try sending OTP (you'll need to provide a phone number)
const testPhoneNumber = process.argv[2]; // Pass phone number as argument
if (testPhoneNumber) {
	console.log(`\n📱 Testing OTP send to ${testPhoneNumber}...`);
	try {
		const verification = await client.verify.v2
			.services(verifySid)
			.verifications.create({
				to: testPhoneNumber,
				channel: 'sms'
			});
		console.log('✅ OTP Status:', verification.status);
		console.log('   Valid:', verification.valid);
		console.log('   To:', verification.to);
	} catch (error) {
		console.error('❌ OTP Send Error:', error.message);
		if (error.code === 60200) {
			console.log(
				'\n⚠️  Trial Account Limitation: You can only send to verified phone numbers in trial mode.'
			);
			console.log('   Solution: Either verify the phone number in Twilio console or upgrade your account.');
		}
	}
} else {
	console.log('\n💡 To test OTP sending, run: node test-twilio.js +919876543210');
}

console.log('\n✅ Test completed!');
