import { google } from "googleapis";
import { NextResponse } from 'next/server';

function formatPrivateKey(key) {
  return key.replace(/\\n/g, '\n').trim();
}

export async function POST(req) {
  try {
    // Construct service account credentials from env variables
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });

    const sheets = google.sheets({ version: "v4", auth });
    const data = await req.json();

    // Format the data for sheets
    const values = [
      [
        data.name,
        data.email,
        data.phone,
        data.country,
        data.contractDetails.startDate,
        data.commission,
        data.paymentDetails.preferredMethod,
        // Add other fields as needed
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A1', // Adjust range as needed
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { message: 'Failed to submit form', error: error.message },
      { status: 500 }
    );
  }
} 