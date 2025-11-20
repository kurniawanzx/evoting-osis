export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({
      success: true,
      message: 'Import students API is working',
      data: { imported: 0, failed: 0, errors: [] }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
