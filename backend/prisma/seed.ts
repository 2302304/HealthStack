import { PrismaClient, MealType, ExerciseType, Intensity, DietType } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo user
  const hashedPassword = await hashPassword('Demo1234');

  const user = await prisma.user.upsert({
    where: { email: 'demo@healthstack.com' },
    update: {},
    create: {
      email: 'demo@healthstack.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create food logs
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.foodLog.createMany({
    data: [
      {
        userId: user.id,
        foodName: 'Kaurapuuro marjoilla',
        calories: 350,
        protein: 12,
        carbs: 55,
        fat: 8,
        fiber: 10,
        mealType: MealType.BREAKFAST,
        servingSize: '1 kulho',
        loggedAt: new Date(now.setHours(8, 0, 0, 0)),
      },
      {
        userId: user.id,
        foodName: 'Kanasalaatti',
        calories: 420,
        protein: 35,
        carbs: 15,
        fat: 22,
        fiber: 5,
        mealType: MealType.LUNCH,
        servingSize: '1 annos',
        loggedAt: new Date(now.setHours(12, 30, 0, 0)),
      },
      {
        userId: user.id,
        foodName: 'Lohta ja parsakaalia',
        calories: 480,
        protein: 42,
        carbs: 12,
        fat: 28,
        fiber: 4,
        mealType: MealType.DINNER,
        servingSize: '200g lohta, 150g vihanneksia',
        loggedAt: new Date(now.setHours(18, 0, 0, 0)),
      },
      {
        userId: user.id,
        foodName: 'Kreikkalainen jogurtti ja pähkinöitä',
        calories: 250,
        protein: 15,
        carbs: 18,
        fat: 14,
        fiber: 3,
        mealType: MealType.SNACK,
        servingSize: '150g jogurttia, 30g pähkinöitä',
        loggedAt: new Date(now.setHours(15, 0, 0, 0)),
      },
    ],
  });

  console.log('✅ Created food logs');

  // Create exercises
  await prisma.exercise.createMany({
    data: [
      {
        userId: user.id,
        exerciseName: 'Aamujuoksu',
        exerciseType: ExerciseType.CARDIO,
        duration: 30,
        calories: 280,
        distance: 5,
        intensity: Intensity.MODERATE,
        loggedAt: new Date(now.setHours(7, 0, 0, 0)),
      },
      {
        userId: user.id,
        exerciseName: 'Kuntosaliharjoitus',
        exerciseType: ExerciseType.STRENGTH,
        duration: 45,
        calories: 220,
        intensity: Intensity.HIGH,
        notes: 'Jalkapäivä: kyykky, maastaveto, jalkaprässi',
        loggedAt: yesterday,
      },
    ],
  });

  console.log('✅ Created exercises');

  // Create sleep log
  const sleepStart = new Date(yesterday);
  sleepStart.setHours(22, 30, 0, 0);
  const sleepEnd = new Date(now);
  sleepEnd.setHours(6, 30, 0, 0);

  await prisma.sleepLog.create({
    data: {
      userId: user.id,
      sleepStart,
      sleepEnd,
      duration: 8,
      quality: 8,
      notes: 'Hyvä uni, heräsin virkistyneenä',
    },
  });

  console.log('✅ Created sleep log');

  // Create mood logs
  await prisma.moodLog.createMany({
    data: [
      {
        userId: user.id,
        mood: 8,
        energy: 7,
        stress: 3,
        notes: 'Hyvä päivä, produktiivinen työssä',
        loggedAt: new Date(now.setHours(20, 0, 0, 0)),
      },
      {
        userId: user.id,
        mood: 7,
        energy: 6,
        stress: 4,
        loggedAt: yesterday,
      },
    ],
  });

  console.log('✅ Created mood logs');

  // Create a keto meal plan
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: user.id,
      date: new Date(),
      dietType: DietType.KETO,
      targetCalories: 1800,
      targetProtein: 120,
      targetCarbs: 50,
      targetFat: 140,
      notes: 'Päivän keto-ruokavalio vähäisillä hiilihydraateilla',
    },
  });

  // Create meals for the plan
  await prisma.meal.createMany({
    data: [
      {
        mealPlanId: mealPlan.id,
        name: 'Munakkaat ja avokadoa',
        mealType: MealType.BREAKFAST,
        description: 'Paista munakas voissa, lisää juusto. Tarjoile avokadon kanssa.',
        calories: 420,
        protein: 24,
        carbs: 8,
        fat: 32,
      },
      {
        mealPlanId: mealPlan.id,
        name: 'Kana-caesar-salaatti',
        mealType: MealType.LUNCH,
        description: 'Grillaa kana, sekoita salaatin ja kastikkeen kanssa.',
        calories: 480,
        protein: 38,
        carbs: 6,
        fat: 34,
      },
      {
        mealPlanId: mealPlan.id,
        name: 'Lohipihvi ja parsaa',
        mealType: MealType.DINNER,
        description: 'Paista lohi uunissa 180°C 15 min. Höyrytä parsa.',
        calories: 520,
        protein: 42,
        carbs: 8,
        fat: 36,
      },
    ],
  });

  console.log('✅ Created meal plan with 3 meals');

  // Create shopping list
  const shoppingList = await prisma.shoppingList.create({
    data: {
      userId: user.id,
      name: 'Viikonlopun ostokset',
      items: {
        create: [
          { name: 'Kananmunia', quantity: '1 kenno', category: 'Maitotuotteet', checked: false },
          { name: 'Avokadoja', quantity: '3 kpl', category: 'Hedelmät ja vihannekset', checked: false },
          { name: 'Lohifileitä', quantity: '400g', category: 'Liha ja kala', checked: false },
          { name: 'Parsaa', quantity: '300g', category: 'Hedelmät ja vihannekset', checked: true },
          { name: 'Oliiviöljy', quantity: '1 pullo', category: 'Öljyt ja mausteet', checked: false },
          { name: 'Juusto (cheddar)', quantity: '200g', category: 'Maitotuotteet', checked: false },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log('✅ Created shopping list');

  console.log('🎉 Seed completed successfully!');
  console.log(`\n📧 Demo user credentials:`);
  console.log(`   Email: demo@healthstack.com`);
  console.log(`   Password: Demo1234`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
