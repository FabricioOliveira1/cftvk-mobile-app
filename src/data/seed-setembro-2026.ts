// Dados de treino — Setembro 2026
// Encoding UTF-8 corrigido. Aspas 30" normalizadas para 30''.
// Títulos normalizados: "LPO Day" → "LPO", "Gym Day" / "Gym Day do Amigo" → "GYM", "METCON Day" / "Metcon Day" → "METCON", "Hero Day" → "HERO", "Interativo" → "INTERATIVO"

import { SeedEntry } from './seed-abril-2026';

const SETEMBRO_2026: SeedEntry[] = [
  {
    date: '2026-09-01',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Pé na Parede\n\n2 Rounds Of\n\n20 Lunges\n10 Step Ups\n5 Burpess\n\nForça - Glúteo\n\n4 Rounds Of\n\n6 a 12 Elevações Pélvica\n6 a 12 Back Squats" },
      { id: '2', title: 'Pistol', details: 'Somente Mobilidade' },
      { id: '3', title: "Death By 15'", details: 'Burpee Box Jump Over' },
    ],
  },
  {
    date: '2026-09-02',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30'", details: 'Em Duplas\n\n50 Burpees\n50 Power Cleans (70/45)\n50 Box Jumps\n40 Burpees\n40 Power Cleans\n40 Box Jumps\n30 Burpees\n30 Power Cleans\n30 Box Jumps\n20 Burpees\n20 Power Cleans\n20 Box Jumps\n10 Burpees\n10 Power Cleans\n10 Box Jumps\n\nThen\n\nMax BMU no Tempo que Sobrar' },
    ],
  },
  {
    date: '2026-09-03',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n12 Back Squat To Good Morning\n\n2 Rounds Of\n\n10 Air Squats\n10 G2OH Plate\n10 V-Ups\n\nForça - Snatch High Pull\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Hang Squat Clean', details: "Passo a Passo Guiado\n\nThen\n\nAmrap 8'\n\n1 Hang Squat Clean (AHAP)\n50m Sprint" },
      { id: '3', title: "Emom 8'", details: '1 - 12 Plate Thruster (20/15)\n2 - 15 T2B' },
    ],
  },
  {
    date: '2026-09-04',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando Kb\n30'' Pé na Parede\n30'' Puxando Pé Atrás\n\n2 Rounds Of - Sync Dupla\n\n10 Lunges\n50m Run\n10 Sit Ups\n\nForça - Pistol\n\n4 Rounds Of\n\n12 Box Pistol Kb\n12 Reverse Lunges" },
      { id: '2', title: 'Pistol', details: "Passo a Passo Guiado\n\nQuem Já Faz\n\nAmrap 6'\n5 HSPU\n10 Pistols\n15 Pull Ups" },
      { id: '3', title: "Amrap 12'", details: '100m Buddy Carry\n20 Sit Ups Sync\n20 Lunges Sync\n10 Burpees Sync' },
    ],
  },
  {
    date: '2026-09-05',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-09-07',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Matilde', details: "Amrap 20'\n\n7 Squat Snatch (60/35)\n9m HSW\n20 D.U." },
    ],
  },
  {
    date: '2026-09-08',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Deitado no Ombro\n30'' Deitado no Ombro Invertido\n30'' Mão Na Parede\n\n2 Rounds Of\n\n10 Ring Row\n10 Russian Kb Swings\n50m Run\n\nForça - Pull Up\n\n4 Rounds Of\n\n6 a 12 Strict Pull Ups\n6 a 12 Pull Ups" },
      { id: '2', title: 'BMU', details: 'Passo a Passo Básico Guiado' },
      { id: '3', title: "Emom 12'", details: '1 - 8 BMU\n2 - 150m Sprint\n3 - 15 Kb Swings (32/22)' },
    ],
  },
  {
    date: '2026-09-09',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Blocos 30'", details: "For Time 3'\n\n3 Rounds Of\n50m Farm Walk (22/16)\n8 Double Kb Hang Clean\n\nRest 1'\n\nThen\n\nEmom 6'\n\n1 - 15 Toes To Bar\n2 - 6 High Hang Power Clean (60/35)\n\nRest 1'\n\nThen\n\nAmrap 9'\n\n50 D.U.\n12 Pull Ups\n12 Double Kb Front Squats\n\nRest 1'\n\nThen\n\nEmom 9'\n\n1 - 12 Double Kb Push Press\n2 - 5 Wall Walks\n3 - 12 Kb Step Ups Single Kb" },
    ],
  },
  {
    date: '2026-09-10',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Quads No Hack\n\n2 Rounds Of\n\n10 Air Squats\n10 V-Ups\n12 Cossack Squats\n\nForça - Push Press\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Power Clean', details: "Passo a Passo Guiado\n\nThen\n\nFor Time 10'\n\n3 Rounds Of\n\n6 Power clean (60/35)\n12 Pull Ups\n100m Sprint" },
      { id: '3', title: "Emom 6'", details: '1 - 8 BMU\n2 - 20 Wall Balls (20/16)' },
    ],
  },
  {
    date: '2026-09-11',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Punho No Solo\n12 Toques de Ombro No Solo\n\n2 Rounds Of\n\n10 Sit Ups\n10 Ring row\n5 Shoulder Press\n\nForça - BMU\n\n4 Rounds Of\n\n6 a 12 Remadas Curvadas\n6 a 12 Elevações Pelvicas" },
      { id: '2', title: 'BMU', details: "Passo a Passo Avançado\n\nQuem não entrou da caixa\nAmrap 12'\n3 Tentativas da Caixa\n5 Burpees\n50m Run\n\nQuem já faz\nAmrap 12'\n5 BMU\n12 Box Jump Overs\n3 Strict Pull Ups" },
      { id: '3', title: "For Time 15'", details: '600m Run\n\nThen\n\n5 Rounds Of\n\n12 Push Jerks (60/45)\n12 Deadlifts\n\nThen\n\n600m Run' },
    ],
  },
  {
    date: '2026-09-12',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Luke', details: '400m Run\n12 Clean And Jerks (155/105)\n400m Run\n30 T2B\n400m Run\n45 Wall Balls\n400m Run\n45 Kb Swings (32/22)\n400m Run\n30 Ring Dips\n400m Run\n15 Walking Lunges\n400m Run' },
    ],
  },
  {
    date: '2026-09-14',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão A Frente No Solo\n12 Toques de Ombro No Solo\n\n2 Rounds Of\n\n10 Plate Floor Press\n5 Deadlifts\n5 Hang Clean\n5 Front Squats\n5 Shoulder Press\n\nForça - Power Balance\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Squat Clean', details: "Passo a Passo Guiado\n\nThen\n\n3x3 Squat Cleans Com Hold 2''" },
      { id: '3', title: "Amrap 10'", details: '3 Thruster (50/35)\n30 D.U.\n10 Pull Ups' },
    ],
  },
  {
    date: '2026-09-15',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n15 Giros de Ombro Cada Lado\n30'' Deitado no Ombro\n30'' Deitado no Ombro Invertido\n\n2 Rounds Of\n\n50m Run\n10 Push Ups\n10 Burpees\n\nForça - HSPU\n\n6 a 12 Strict HSPU\n6 a 12 HSPU" },
      { id: '2', title: 'HSPU', details: "Dia 1 - Passo a Passo Básico Até a Virada\n\nQuem já faz\n\nAmrap 12'\n\n12 HSPU\n20 Jumping Squats\n50 Polichinelos" },
      { id: '3', title: "Amrap 5'", details: '6 G2OH (20/15)\n6 Burpees To Plate\n30 D.U' },
    ],
  },
  {
    date: '2026-09-16',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30'", details: '1Km Run\n\n2 Rounds Of\n\n5 Hang Power Snatchs (50/30)\n10 Overhead Squat\n10 Burpees Over The Bar\n\n600m Run\n\n2 Rounds Of\n\n3 Squat Snatchs\n3 Hang Squat Snatchs\n3 High Hang Squat Snatchs\n20 Barbell Hops\n\n1Km Run' },
    ],
  },
  {
    date: '2026-09-17',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Quads No Hack\n30'' Agachado\n30'' Pesando\n30'' Bom Dia\n\n2 Rounds Of\n\n10 Air Squats\n5 Deadlifts\n30 Polichinelos\n\nForça - Clean Pull\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Push Press + Push Jerk', details: "Passo a Passo Guiado\n\nThen\n\nAmrap 6'\n\n8 Push Jerks (60/35)\n12 Sumo Deadlifts" },
      { id: '3', title: "Emom 6'", details: '1 - 12 Ring Dips\n2 - Max Abd Remador' },
    ],
  },
  {
    date: '2026-09-18',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' PVC Pass\n30'' Punho No PVC\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n\n2 Rounds Of\n\n10 Cachorros Mancos\n10 Push Ups\n50 Estacionadas\n\nForça - HSPU\n\n5 Rounds Of\n\n6 Strict HSPU\n40'' Handstand Hold" },
      { id: '2', title: 'Handstand Push Up Dia 2', details: "Passo a Passo Avançado\n\nPra Quem Não Virou Sozinho\n\nAmrap 12'\n\n100m Run\n3 Tentativas de Virada Na Parede\n10 Push Ups\n\nPra Quem Já Faz\n\nEmom 12'\n\n1 - 150m Sprint\n2 - 12 HSPU\n3 - 20 V-Ups Alternados" },
      { id: '3', title: "For Time 12'", details: 'Em Duplas\n\n600m Mb Run (1 Bola Por Dupla)\n50 Wall Ball Sync\n20 Burpees Sync\n50 T2B Sync\n600m Mb Run' },
    ],
  },
  {
    date: '2026-09-19',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-09-21',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Pé Na Parede\n30'' Puxando Atras\n30'' Sentado No Solo Perna Aberta\n30'' Mão Em Cada Pé\n\n2 Rounds Of\n\n50m Run\n5 Deadlifts\n30 Polichinelos\n\nForça - Snatch Pull\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Deadlift', details: 'Correção Postural, Ajuste de Pegada e Prática Sem Muita Carga.' },
      { id: '3', title: 'Open 24.2', details: "Amrap 20'\n\n300m Row\n10 Deadlifts (83/56)\n50 D.U." },
    ],
  },
  {
    date: '2026-09-22',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado no Ombro\n30'' Deitado no Ombro Invertido\n12 Toques de Ombro No Solo\n\n2 Rounds Of\n\n10 Ring Row\n10 Sit Ups\n5 Hang Clean\n5 Front Squats\n\nForça - Pull Up\n\n5 Rounds Of\n\n6 a 8 Strict Pull Ups\n10 Balanços Com Pull Over" },
      { id: '2', title: 'Butterfly Pull Up Dia 1', details: 'Passo a Passo Guiado Solo e Caixa' },
      { id: '3', title: "Amrap 6'", details: '6 Zombie Plate Crunch\n6 Front Squats (60/45)' },
    ],
  },
  {
    date: '2026-09-23',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30'", details: 'Duplas\n\n500 Air Squats Dividido Como Quiser - 1 Fica Em Chair Hold\n\nEach Break\n\n150m Run Juntos\n20 Power Cleans (60/35)' },
    ],
  },
  {
    date: '2026-09-24',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Lombar no Solo Cada Lado\n\n2 Rounds Of\n\n5 Hang Clean\n5 Back Squats\n10 Step Ups\n\nForça - Snatch High Pull\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Hang Power Snatch', details: "Passo a Passo Guiado\n\nThen\n\nFor Time 5'\n21-15-9\nHang Power Snatch (70/45)\nNo Inicio de Cada Round 6 BOTB + 12 T2B" },
      { id: '3', title: "Amrap 5'", details: 'Max Hip Tap Suspenso\n\nEach Break 5 Burpees' },
    ],
  },
  {
    date: '2026-09-25',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n15/15 PVC Pass Lateral\n30'' Agachado em OH\n30'' Pesando\n\n2 Rounds Of\n\n10 Ring Row\n5 Hang Snatch\n5 OHS\n\nForça - Dorsal\n\n4 Rounds Of\n\n6 a 8 / 6 a 8 Remadas Serrotes\n6 a 8 Remadas Curvadas Pronadas" },
      { id: '2', title: 'Butterfly Pull Up Dia 2', details: "Passo a Passo Avançado\n\nQuem Não Conseguiu Realizar o Butterfly Na Caixa\n\nEmom 12'\n\n1 - 12 Burpees\n2 - 10 Ring Row DEITADO NO SOLO\n3 - 8 Pull Overs Suspenso\n\nQuem Já Faz:\n\nAmrap 12'\n\n6 Pull Ups (Obrigatorio em Butterfly)\n8 Box Jump Overs\n10 V-Ups" },
      { id: '3', title: "For Time 12'", details: 'Duplas\n\n2 Rounds Of\n\n30 Plate Thruster Sync (20/15)\n30 Burpees To Plate Sync\n30 G2OH Sync\n100 D.U.' },
    ],
  },
  {
    date: '2026-09-26',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Luke', details: '400m Run\n12 Clean And Jerks (155/105)\n400m Run\n30 T2B\n400m Run\n45 Wall Balls\n400m Run\n45 Kb Swings (32/22)\n400m Run\n30 Ring Dips\n400m Run\n15 Walking Lunges\n400m Run' },
    ],
  },
  {
    date: '2026-09-28',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão A Frente No Solo\n12 Toques de Ombro No Solo\n\n2 Rounds Of\n\n10 Plate Floor Press\n10 Push Ups\n5 Deadlifts\n5 Hang Cleans\n\nForça - Power Clean\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Split Jerk', details: 'Passo a Passo Com Carga' },
      { id: '3', title: "Emom 12'", details: 'A Cada 2\' Por 12\'\n\n100m Sprint\n12 Wall Balls (20/16)\n20 Lunges' },
    ],
  },
  {
    date: '2026-09-29',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n15/15 PVC Pass Lateral\n30'' Mão Na Parede\n15/15 Hip Tilt\n\n2 Rounds Of\n\n10 Ring Row\n30 Polichinelos\n100m Run\n\nForça - Ring Muscle Up\n\n5 Rounds Of\n\n10 Transferências na Argola\n6 Strict Dips" },
      { id: '2', title: 'Ring Muscle Up', details: "Passo a Passo Solo e Argolas Baixas\n\nQuem já faz:\n\nAmrap 12'\n\n50m Farm Walk (22/16)\n3 Hang Squat Snatch (50/35)\n3 RMU" },
      { id: '3', title: "Emom 6'", details: '1 - 50 D.U.\n2 - 5 Wall Walks \n3 - 150m Sprint' },
    ],
  },
  {
    date: '2026-09-30',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30' - Circuito", details: "2' Em Cada Estação\n\n1 - Tire Flip\n2 - Pull Up\n3 - D.U.\n4 - Kb Swings\n5 - HSPU\n6 - Run\n7 - OHS\n8 - T2B\n9 - Burpee\n10 - Shoulder Press\n11 - Rope Climb\n12 - Bike\n13 - Wall Ball\n14 - Pistol\n15 - Row" },
    ],
  },
];

export default SETEMBRO_2026;
