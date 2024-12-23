// pages/api/content/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  try {
    const client = await MongoClient.connect(process.env.DATABASE_URL!);
    const db = client.db();
    
    const content = await db.collection('contents').findOne({ _id: id });
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
