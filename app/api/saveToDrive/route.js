import { google } from 'googleapis';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();
    const { fileName, fileData, isDraft } = data;

    if (!fileName || !fileData) {
      console.error('Missing required fields:', { fileName: !!fileName, fileData: !!fileData });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      let credentials;
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      } catch (parseError) {
        console.error('Failed to parse service account key:', parseError);
        return NextResponse.json(
          { 
            message: 'Invalid service account configuration',
            error: parseError.message
          },
          { status: 500 }
        );
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive']
      });

      const drive = google.drive({ version: 'v3', auth });

      const folderId = isDraft 
        ? process.env.GOOGLE_DRIVE_DRAFTS_FOLDER_ID 
        : process.env.GOOGLE_DRIVE_SIGNED_FOLDER_ID;

      console.log('Using folder:', {
        folderId,
        isDraft,
        type: isDraft ? 'drafts' : 'signed'
      });

      // Create file metadata without writersCanShare
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };

      const media = {
        mimeType: 'application/pdf',
        body: Readable.from(Buffer.from(fileData, 'base64'))
      };

      // Create the file with shared drive support
      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink, parents',
        supportsAllDrives: true
      });

      console.log('File created:', {
        id: file.data.id,
        parents: file.data.parents,
        link: file.data.webViewLink
      });

      // Create a public sharing link
      try {
        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          },
          supportsAllDrives: true
        });
      } catch (permError) {
        console.log('Permission setting skipped:', permError.message);
        // Continue even if permission setting fails
      }

      return NextResponse.json({ 
        fileId: file.data.id,
        viewLink: file.data.webViewLink
      });
    } catch (driveError) {
      console.error('Google Drive error:', driveError);
      return NextResponse.json(
        { 
          message: 'Failed to save file to Google Drive',
          error: driveError.message,
          details: driveError.stack
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { 
        message: 'Failed to process request',
        error: error.message,
        details: error.stack
      },
      { status: 400 }
    );
  }
} 