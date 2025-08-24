# HackWave 2.0 Setup Instructions

## Environment Variables Required

To resolve the 400 Bad Request error, you need to set up the following environment variables:

### 1. Create a `.env.local` file in your project root:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hackwave

# Google AI API Key (Required for AI data mapping)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here

# Optional: OAuth Providers
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Get a Google AI API Key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### 3. Set up MongoDB:

- **Local MongoDB**: Install MongoDB locally and run `mongod`
- **MongoDB Atlas**: Use a cloud MongoDB instance and update the URI

### 4. Restart your development server:

```bash
npm run dev
```

## Current Status

The Data History feature has been implemented and is working, but the AI data mapping is temporarily disabled due to the missing API key. Once you add the Google AI API key, the full functionality will be restored.

## Testing the Data History

1. Upload any Excel/CSV file through the interface
2. The file will be processed and logged (without AI mapping)
3. Check the Data History section below the upload form
4. You should see your uploaded files listed with timestamps

## Troubleshooting

If you still get a 400 error:
1. Check the browser console for specific error messages
2. Verify MongoDB is running and accessible
3. Ensure all environment variables are set correctly
4. Check the server logs for detailed error information
