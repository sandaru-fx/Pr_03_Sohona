import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First delete the ones we just added
  await prisma.package.deleteMany();

  // Insert the correct ones based on user's screenshot
  await prisma.package.createMany({
    data: [
      {
        name: 'A',
        description: '25 Years Design',
        retentionYears: 25,
        priceAmount: 5000,
        priceCurrency: 'LKR',
        features: ['1 Minute Video Spec', '2 Minutes Audio Spec', '5 Images', 'Word 500 Spec', 'Comment Section: Word 100*5'],
        isActive: true,
      },
      {
        name: 'B',
        description: '50 Years Design',
        retentionYears: 50,
        priceAmount: 8000,
        priceCurrency: 'LKR',
        features: ['1 Minute Video Spec', '2 Minutes Audio Spec', '5 Images', 'Word 500 Spec', 'Comment Section: Word 100*5'],
        isActive: true,
      },
      {
        name: 'C',
        description: '100 Years Design',
        retentionYears: 100,
        priceAmount: 15000,
        priceCurrency: 'LKR',
        features: ['1 Minute Video Spec', '2 Minutes Audio Spec', '5 Images', 'Word 500 Spec', 'Comment Section: Word 100*5'],
        isActive: true,
      }
    ]
  });

  console.log('Packages updated successfully to match A (25 yrs), B (50 yrs), and C (100 yrs)!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
