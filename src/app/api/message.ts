import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { message } = req.body;
        // Process the message here, e.g., save to a database or send it somewhere.

        // Send a response back
        res.status(200).json({ message: 'Message received', data: message });
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}