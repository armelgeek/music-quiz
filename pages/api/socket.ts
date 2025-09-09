import { NextApiRequest } from 'next';
import { initSocketServer, SocketServerResponse } from '@/shared/lib/socket-server';

export default function handler(req: NextApiRequest, res: SocketServerResponse) {
  if (req.method === 'GET') {
    // Initialize the socket server
    initSocketServer(res);
    
    res.status(200).json({ 
      message: 'Socket.IO server initialized',
      path: '/api/socket'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}