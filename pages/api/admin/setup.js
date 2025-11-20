export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'Admin setup API is working',
      data: { hasAdmin: false, admins: [] }
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
