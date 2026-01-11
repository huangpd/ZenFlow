import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sutras = [
  {
    title: '金刚经',
    content: '如是我闻。一时佛在舍卫国。祗树给孤独园。与大比丘众。千二百五十人俱。尔时世尊。食时。著衣持钵。入舍卫大城乞食。于其城中。次第乞已。还至本处。饭食讫。收衣钵。洗足已。敷座而坐。',
    description: '金刚般若波罗蜜经'
  },
  {
    title: '心经',
    content: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。',
    description: '般若波罗蜜多心经'
  },
  // 可以添加更多长文本...
];

async function main() {
  console.log('Seeding sutras...');
  for (const sutra of sutras) {
    await prisma.sutra.upsert({
      where: { title: sutra.title },
      update: {},
      create: sutra,
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
