import dbConnect from '../../lib/mongodb';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Starting database connection test...');

  try {
    const conn = await dbConnect();
    
    console.log('Connection state:', conn.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

    res.status(200).json({ 
      success: true,
      message: 'Database connected successfully',
      connectionState: conn.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Detailed connection error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });

    res.status(500).json({ 
      success: false,
      error: error.message,
      errorCode: error.code,
      errorName: error.name,
      timestamp: new Date().toISOString()
    });
  }
} 