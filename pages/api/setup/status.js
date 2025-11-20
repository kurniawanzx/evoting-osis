export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: {
        isSetupCompleted: false,
        setupStatus: false,
        collections: {
          existing: [],
          missing: ['users', 'candidates', 'votes', 'settings'],
          required: ['users', 'candidates', 'votes', 'settings']
        }
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
