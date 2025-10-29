# MSG91 Setup Guide

## Step 1: Sign Up for MSG91

1. Go to: https://control.msg91.com/signup/
2. Sign up with your email
3. Verify your email address
4. Complete the registration

## Step 2: Get Your Auth Key

1. After login, go to: https://control.msg91.com/user/index.php#api
2. Copy your **Auth Key** (it's a long alphanumeric string)
3. Save it for later

## Step 3: Create an OTP Template

1. Go to: https://control.msg91.com/app/sms/manage-template
2. Click **"+ Add New Template"**
3. Fill in the details:
   - **Template Name**: FlavorSouth OTP
   - **Template Type**: Select "Transactional"
   - **Template Category**: Select "OTP"
   - **Template Content**: 
     ```
     ##OTP## is your FlavorSouth verification code. Valid for 5 minutes. Do not share with anyone.
     ```
   - Replace `##OTP##` with the exact variable name MSG91 expects
4. Click **"Submit for Approval"**
5. Once approved (usually instant for OTP templates), copy the **Template ID**

## Step 4: Add Credentials to Your Project

### Local Development (.env file):
```env
MSG91_AUTH_KEY="YOUR_AUTH_KEY_HERE"
MSG91_TEMPLATE_ID="YOUR_TEMPLATE_ID_HERE"
```

### Production (Vercel):
Run these commands:
```bash
npx vercel env add MSG91_AUTH_KEY production
npx vercel env add MSG91_TEMPLATE_ID production
npx vercel env add MSG91_AUTH_KEY preview
npx vercel env add MSG91_TEMPLATE_ID preview
npx vercel env add MSG91_AUTH_KEY development
npx vercel env add MSG91_TEMPLATE_ID development
```

## Step 5: Test the Integration

1. Start your local dev server: `npm run dev`
2. Go to: http://localhost:5173/auth
3. Enter an Indian phone number (+91XXXXXXXXXX)
4. Click "Send Verification Code"
5. You should receive the OTP within seconds!

## Free Tier Benefits

✅ **10,000 FREE OTP verifications per month**
✅ Works with ANY Indian phone number
✅ No verification needed
✅ Fast delivery
✅ Excellent for development and production

## Troubleshooting

### Issue: "Invalid Auth Key"
- Double-check you copied the Auth Key correctly
- Make sure there are no extra spaces

### Issue: "Template not found"
- Ensure your template is approved
- Check the Template ID is correct

### Issue: "Mobile number not valid"
- Make sure phone number is in format: 919876543210 (no + or spaces)
- Must be an Indian number starting with 91

## Support

MSG91 Support: https://msg91.com/help
Documentation: https://docs.msg91.com/
