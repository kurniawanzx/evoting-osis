export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      success: true, 
      message: 'Admin setup API is working',
      data: { hasAdmin: false, admins: [], total: 0 }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
