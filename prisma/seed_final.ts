import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const presets = [
  { title: '清晨上香', type: 'normal', iconId: 'flame', content: '' },
  { title: '楞严咒', type: 'counter', iconId: 'hash', content: '', defaultStep: 1 },
  { title: '大悲咒', type: 'counter', iconId: 'hash', content: '', defaultStep: 108 },
  { title: '十小咒', type: 'counter', iconId: 'hash', content: '', defaultStep: 108 },
  { title: '八十八佛', type: 'counter', iconId: 'hash', content: '', defaultStep: 1 },
];

const sutras = [
  { 
    title: '金刚经', 
    type: 'sutra',
    iconId: 'book',
    content: '如是我闻。一时佛在舍卫国。祗树给孤独园。与大比丘众。千二百五十人俱。尔时世尊。食时。著衣持钵。入舍卫大城乞食。于其城中。次第乞已。还至本处。饭食讫。收衣钵。洗足已。敷座而坐。' 
  },
  { 
    title: '心经', 
    type: 'sutra',
    iconId: 'book',
    content: '观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。' 
  },
];

async function main() {
  console.log('Final seeding of unified task templates...');
  
  for (const item of [...presets, ...sutras]) {
    await prisma.sutra.upsert({
      where: { title: item.title },
      update: {
        type: item.type,
        iconId: item.iconId,
        content: item.content,
        defaultStep: (item as any).defaultStep || 1
      },
      create: {
        title: item.title,
        type: item.type,
        iconId: item.iconId,
        content: item.content,
        defaultStep: (item as any).defaultStep || 1
      },
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
