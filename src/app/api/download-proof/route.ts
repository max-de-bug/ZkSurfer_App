import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Replace this with your actual proof data (or generate it as needed)
    const proofData = { foo: 'bar', timestamp: Date.now() };
    const fileContent = JSON.stringify(proofData, null, 2);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="proof.json"');
    res.status(200).send(fileContent);
}