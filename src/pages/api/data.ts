import { NextApiRequest, NextApiResponse } from 'next';
import { Pillar } from '@/types/mongo';
import { MongoClient } from 'mongodb';

// Environment variable for the database URL
const DATABASE_URL = process.env.DATABASE_URL!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { locale = 'en' } = req.query;

  // Ensure locale is provided
  if (!locale || typeof locale !== 'string') {
    return res.status(400).json({ error: 'Locale is required and must be a string' });
  }

  let client: MongoClient | null = null; // Initialize as null

  try {
    // Connect to MongoDB
    client = await MongoClient.connect(DATABASE_URL);
    const dbName = new URL(DATABASE_URL).pathname.substring(1); // Extract DB name from URL
    const db = client.db(dbName);

    // Fetch and aggregate data
    const pillars = await db
      .collection('pillars')
      .aggregate<Pillar>([
        {
          $lookup: {
            from: 'branches',
            localField: 'branches',
            foreignField: '_id',
            as: 'branches',
          },
        },
        {
          $unwind: {
            path: '$branches',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'contents',
            localField: 'branches.contentItems',
            foreignField: '_id',
            as: 'branches.contentItems',
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            order: { $first: '$order' },
            branches: { $push: '$branches' },
          },
        },
        {
          $sort: {
            order: 1,
          },
        },
      ])
      .toArray();

    // Translate content based on locale
    const translatedPillars = pillars.map((pillar) => ({
      ...pillar,
      branches: pillar.branches.map((branch) => ({
         ...branch,
         contentItems: branch.contentItems.map((content) => ({
           ...content,
           translations: content.translations,
         })),
      })),
    }));

    // Return translated data
    res.status(200).json({ pillars: translatedPillars });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Ensure client is closed
    if (client) {
      await client.close();
    }
  }
}

export default handler;
