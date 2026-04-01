// Dados de treino — Maio 2026
// Encoding UTF-8 corrigido.
// 2026-05-18: titulo corrigido de "a" → "LPO" (segunda-feira)
// 2026-05-21: titulo corrigido de "a" → "LPO" (quinta-feira)
// 2026-05-22: titulo corrigido de "a" → "GYM" (sexta-feira)

import { SeedEntry } from './seed-abril-2026';

const MAIO_2026: SeedEntry[] = [
  {
    date: '2026-05-01',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta de Pé\n30'' Mão Em Cada Pé\n30'' Agachado\n\n2 Rounds Of\n\n5 Deadlifts\n10 Ring Row\n10 Air Squats\n\nForça - Trapezio\n\n4 Rounds Of\n\n12 Encolhimento de Ombros\n6 Remadas Altos" },
      { id: '2', title: 'HSW', details: "Dia 2 \n\nAmrap 10'\n\n10m HSW\n12 Kb Push Press\n12 Kb Snatch" },
      { id: '3', title: "Emom 6'", details: '1 - 7 Deadlifts (100/70)\n2 - 20 Jumping Squats' },
    ],
  },
  {
    date: '2026-05-02',
    title: 'Hero',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'Johnson', details: "Amrap 20'\n\n9 Deadlifts (120/80)\n8 Muscle Ups\n9 Squat Cleans (70/50)" },
    ],
  },
  {
    date: '2026-05-04',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n\n2 Rounds Of\n\n5 Deadlifts\n5 Shoulder Press\n10 Air Squats\n5 Burpees\n50m Run\n\nForça - Front Squat\n\n3x3- 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Push Press + Push Jerk', details: 'Passo a Passo Guiado' },
      { id: '3', title: "Amrap 10'", details: '50m Sprint\n10 Wall Balls (20/14)' },
    ],
  },
  {
    date: '2026-05-05',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n15 Giros de Ombro Cada Lado\n\n10 Push Ups\n10 Sit Ups\n\nForça - Biceps\n\n4 Rounds Of\n\n6 Biceps Direto\n20'' Iso Biceps" },
      { id: '2', title: 'Peg Board', details: "Emon 9'\n\n1- 1 Peg Board / 1 Rope Climb / 3 Rope Ascent\n2- 50 m Farm Walk pesado\n3- Rest" },
      { id: '3', title: "Emom 12'", details: 'RX\n\n1 - 10 HSPU\n2 - 15 V-Ups\n3 - Rest\n\nScaled\n\n1 - 20 Push Ups\n2 - 15 V-Ups\n3 - Rest' },
    ],
  },
  {
    date: '2026-05-06',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30'", details: "A Cada 4' Por 30'\n\n400m Run\n20 Box Jumps\n20 Kb Swings (22/16)\n20 Wall Balls (20/14)\n20 Burpees\n\nRest 1'" },
    ],
  },
  {
    date: '2026-05-07',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Mão Na Parede\n\n5 Deadlifts\n5 Hang Cleans\n5 Front Squats\n\nForça - Shoulder Press\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'TKGUP', details: 'Passo a Passo Com Teste de Carga' },
      { id: '3', title: "Emom 12'", details: '1 - 6 TKGUP R-Arm (22/16)\n2 - 6 TKGUP L-Arm\n3 - 20 Kb Swings' },
    ],
  },
  {
    date: '2026-05-08',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n12 Toques No Pé A Frente\n\n2 Rounds Of\n\n100m Run\n5 Deadlifts\n\nForça - Estabilização de Joelho\n4 Rounds Of\n12 Step Ups Barbell\n12 Aviõeszinhos" },
      { id: '2', title: 'Rope Climb', details: "Passo a Passo Guiado\n\nQuem Já Sobe\n\nEmom 8'\n\n1 - 2 Rope Climbs\n2 - 150m Run\n3 - 6 Biceps Diretos\n4 - 12 Burpees" },
      { id: '3', title: "For Time 4'", details: '600m Run\nMax Reps Deadlifts (110/80)' },
    ],
  },
  {
    date: '2026-05-09',
    title: 'Interativo',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: 'DUPLAS\n\nAmrap 20\'\n\n20 Squat Sync\n20 Sit up Sync\n200m Run JUNTOS\n20 Burpees Sync' },
    ],
  },
  {
    date: '2026-05-11',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' OH Hold\n30'' Pesando\n\n2 Rounds Of\n\n5 Hang Snatchs\n5 OHS\n100m Run\n\nForça - OHS\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Hang Clean', details: "Emon 9'\n\n1- 50m Farm Walk\n2- 6 Hang Clean (70/ 50)\n3- 8 Pull ups" },
      { id: '3', title: "For Time 9'", details: '200m Run\n15 Squat Cleans (60/45)\n200m Run' },
    ],
  },
  {
    date: '2026-05-12',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n15 Giros de Ombro Cada Direção\n\n10 Ring Row\n10 Push Ups\n10 Air Squats\n\nForça - Estabilização de Ombro\n\n4 Rounds Of\n20m KB Inverted Hold" },
      { id: '2', title: 'Pull Up- Kipping', details: "Passo a Passo \n\nQuem Já faz\n\nAmrap 6'\n\n1-2-3-4-5-6-7-8-9-...\n\nPower Snatch\nPull Ups" },
      { id: '3', title: "Emom 15'", details: '1 - 10 BJO\n2 - 15 Globet Squat (22/18)\n3 - 20 Sit ups' },
    ],
  },
  {
    date: '2026-05-13',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: "Amrap 30'", details: '300m Run\n5 Pull Ups\n10 Push Ups\n15 Air Squats' },
    ],
  },
  {
    date: '2026-05-14',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' OH Hold\n30'' Pesando\n\n5 Hang Snatchs\n5 OHS\n5 Press BN\n\nForça - Bench Press\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Squat Snatch', details: "Amrap 6'\n\n1-2-3-4-5-6-7-8-9-...\nSquat Snatch\nMuscle Up" },
      { id: '3', title: "Amrap 12'", details: '6 Burpees Box Jump Over\n6 Ring Dip\n12 V-Ups' },
    ],
  },
  {
    date: '2026-05-15',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n\n2 Rounds Of\n\n3 Strict Pull Ups\n5 Deadlifts\n5 Hang Snatch\n\nForça - Back Squat\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Pull Up', details: 'Butterfly, Passo a Passo para todos' },
      { id: '3', title: "Emom 4'", details: '1 - 20 Mb Cleans (20/14)\n2 - 20 Wall Balls' },
    ],
  },
  {
    date: '2026-05-16',
    title: 'Interativo',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: 'Interativo' },
    ],
  },
  {
    date: '2026-05-18',
    title: 'LPO', // corrigido de "a" (segunda-feira)
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Mão A Frente No Solo\n12 Toques de Ombro No Solo\n\n2 Rounds Of\n\n5 Deadlifts\n5 Hang Clean\n5 Shoulder Press\n\nForça - Split Jerk\n\n4x3 - 65%\n4x2 - 70%\n3x3 - 75%" },
      { id: '2', title: 'Kb Snatch', details: 'Passo a Passo Guiado \n-Power\n-Squat' },
      { id: '3', title: "Amrap 10'", details: '10 Jumping Squats\n10 Jumping Lunges\n50m Sprint' },
    ],
  },
  {
    date: '2026-05-19',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Sentado No Solo Gluteo\n\n10 Air Squats\n10 Reverse Lunges\n12 V-Ups\n\nForça - Glute\n\n4 Rounds Of\n\n6/6 Bulgarian Squats\n6 Hip Thrusters" },
      { id: '2', title: 'Pistol', details: "Amrap 10'\n\n6 Pistol / 12 Reverse lunge\n12 Globet Squat\n50m Run" },
      { id: '3', title: "Emom 12'", details: '1 - 12 Kb Cossack Squats (22/16)\n2 - 15 Kb Swings\n3 - Rest' },
    ],
  },
  {
    date: '2026-05-20',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30'", details: 'Rx\n\n1 - 6 Clean And Jerk (60/45)\n2 - 6 BMU\n3 - 50 D.U.\n4 - 20 V-Ups\n5 - Rest\n\nIntermediario\n\n1 - 6 Clean And Jerk (50/35)\n2 - 6 C2B\n3 - 100 S.U.\n4 - 20 V-Ups\n5 - Rest\n\nScaled\n\n1 - 6 Clean And Jerk (40/25)\n2 - 6 Jumping Pull up/ Ring Row\n3 - 100 S.U.\n4 - 20 V-Ups\n5 - Rest' },
    ],
  },
  {
    date: '2026-05-21',
    title: 'LPO', // corrigido de "a" (quinta-feira)
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n\nBring Sally Front Squat\n\nForça - Front Squat\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Sumo Deadlift High Pull', details: 'Passo a Passo Guiado' },
      { id: '3', title: "Amrap 12'", details: '5 Deadlifts (100/70)\n10 BOTB\n10 HSPU' },
    ],
  },
  {
    date: '2026-05-22',
    title: 'GYM', // corrigido de "a" (sexta-feira)
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Sentado No Calcanhar\n\n2 Rounds Of\n\n10 Air Squats\n10 Lunges\n30'' Mb March\n\nForça - Ombro\n\n4 Rounds Of\n\n6 Abdução de Ombro\n6 Desenvolvimento de Ombro Kb" },
      { id: '2', title: 'Box Jump Over', details: "Emon 9'\n\n1- 10 box jump over\n2- 40'' chair hold\n3- 10 squat jumping" },
      { id: '3', title: "For Time 6'", details: 'Rx\n\n30 Pull Ups\n15 Deadlifts (100/70)\n300m Run\n\nIntermediario\n\n30 Jumping Pull up\n15 Deadlifts (80/60)\n300m Run\n\nScaled\n\n60 Ring Row\n15 Deadlifts (70/50)\n300m Run' },
    ],
  },
  {
    date: '2026-05-23',
    title: 'Hero',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'Jorge', details: '30 GHD Sit Ups\n15 Squat Cleans (70/50)\n24 GHD Sit Ups\n12 Squat Cleans\n18 GHD Sit Ups\n9 Squat Cleans\n12 GHD Sit Ups\n6 Squat Cleans\n6 GHD Sit Ups\n3 Squat Cleans' },
    ],
  },
  {
    date: '2026-05-25',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' OH Hold\n30'' Elevando Cotovelo Na Barra\n\n2 Rounds Of\n\n5 Hang Snatch\n5 OHS\n5 Press BN\n\nForça - Shoulder press\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Hang Power Snatch', details: "Amrap 8'\n\n6 Hang Power Snatch\n10 Burpees BJO" },
      { id: '3', title: "Amrap 10'", details: 'Rx\n\n100m Run\n10 HSPU\n6 SDHP (60/45)\n\nIntermediario\n\n100m Run\n10 HSPU na anilha\n6 SDHP (50/35)\n\nScaled\n\n100m Run\n20 Push ups\n6 SDHP (40/25)' },
    ],
  },
  {
    date: '2026-05-26',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Punho No Solo\n30'' Mão Na Frente\n\n10 Cachorros Mancos\n10 Push Ups\n10 Hollow Rocks\n\nForça - Estabilização de Ombro\n\n4 Rounds Of\n\n12 Push Press Kb\n40'' OH Hold Kb" },
      { id: '2', title: 'Handstand Push Up', details: "Passo a Passo Guiado\nQuem já faz\n\nEmon 9'\n\n1- 5 Strict HSPU\n2- 10 HSPU\n3- Rest" },
      { id: '3', title: "Emom 10'", details: '1 - 4 Wall Walks\n2 - 40\'\' Front Plank\n3 - 15 Kb Swings (32/22)\n4 - 20 V-ups\n5 - Rest' },
    ],
  },
  {
    date: '2026-05-27',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: "Amrap 30'", details: 'Duplas\n\n100 D.U.\n20 Pull ups\n100 D.U.\n20 OHS (50/35)\n100 D.U.\n20 HSPU\n100 D.U.\n20 Front Squats' },
    ],
  },
  {
    date: '2026-05-28',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' Punho No Solo\n30'' Elevando Cotovelo Na Barra\n\n5 Deadlifts\n5 Hang Cleans\n5 Shoulder Press\n\nForça - OHS\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Split Jerk', details: "Amrap 6'\n\n1-2-3-4-5-6-7-8-...\nSplit Jerk\nStrict Pull Up" },
      { id: '3', title: "For Time 15'", details: 'Rx\n\n1km Run\n30 Clean And Jerk (60/45)\n30 Pull Ups\n1km Run\n\nIntermediario\n\n1km Run\n30 Clean And Jerk (60/45)\n30 Jumping Pull Ups\n1km Run\n\nScaled\n\n600m Run\n30 Clean And Jerk (60/45)\n50 Ring Row\n600m Run' },
    ],
  },
  {
    date: '2026-05-29',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão No Solo\n12 Toques No Ombro\n\n2 Rounds Of\n\n10 Push Ups\n12 Perdigueiros\n\nForça - Estabilização de Ombro\n\n4 Rounds Of\n\n30'' Handstand Hold\n12 Push Press Kb" },
      { id: '2', title: 'Handstand Push Up', details: "Passo a Passo Guiado Avançado\n\nQuem não vira sozinho/ Rx\n\nAmrap 12'\n\n12 Cachorros Mancos / 10 HSPU\n1' Prancha\n10 Kb Shoulder press (20/16)" },
      { id: '3', title: "Emom 5'", details: 'Rx\n\n1 - 45\'\' D.U.\n2 - 45\'\' V-Ups\n3 - 45\'\' HSPU\n4 - 45\'\' Back Squats (60/45)\n5 - Rest\n\nIntermediario\n\n1 - 45\'\' D.U.\n2 - 45\'\' V-Ups\n3 - 45\'\' HSPU na anilha\n4 - 45\'\' Back Squats (50/35)\n5 - Rest\n\nScaled\n\n1 - 45\'\' S.U.\n2 - 45\'\' V-Ups\n3 - 45\'\' Push up\n4 - 45\'\' Back Squats (40/25)\n5 - Rest' },
    ],
  },
  {
    date: '2026-05-30',
    title: 'Interativo',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: 'Interativo' },
    ],
  },
];

export default MAIO_2026;
