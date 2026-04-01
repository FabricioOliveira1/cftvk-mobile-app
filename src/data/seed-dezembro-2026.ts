// Dados de treino — Dezembro 2026
// Encoding UTF-8 corrigido. "â" corrigido para '' (segundos) ou ' (minutos).
// Títulos normalizados: "LPO Day" → "LPO", "Gym Day" / "GYM Day" → "GYM", "Metcon Day" / "METCON Day" → "METCON", "Hero Day" → "HERO", "Interativo" → "INTERATIVO", "Fechado" → "FECHADO"
// 2026-12-10: "8 Thruster (60/35(" corrigido para "8 Thruster (60/35)"
// 2026-12-16: "Ãrvore de Natal" corrigido para "Árvore de Natal"
// 2026-12-25 e 2026-12-31: FECHADO — ignorados pela função

import { SeedEntry } from './seed-abril-2026';

const DEZEMBRO_2026: SeedEntry[] = [
  {
    date: '2026-12-01',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n30'' Agachado\n30'' Pesando\n\nWarm Up\n\nEmom 9'\n\n1 - 10 Step Ups\n2 - 50 Single Under\n3 - 12 Agachamentos\n\nForça - Panturrilhas\n\n12/12 Panturrilha C/ Kb Unilateral Na Plate\n10/10 Extensão De Joelho Kb Na Plyo Box" },
      { id: '2', title: 'Box Jump Over', details: "Emom 12'\n\n1 - 12 Box Jumps Over\n2 - 12 Double Kb Push Press\n3 - 50 D.U." },
      { id: '3', title: "Amrap 10'", details: '20 V-Ups\n12 Reverse Burpees\n12 Russian Twists (32/22)' },
    ],
  },
  {
    date: '2026-12-02',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Específicos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30' - Trios", details: 'Copas - Burpees\nOuros - Flexão \nEspadas - Passada\nPaus - Corrida' },
    ],
  },
  {
    date: '2026-12-03',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Agachado\n30'' Pesando\n30'' Sentado No Solo\n30'' Mão Em Cada Pé\n\nWarm Up\n\nA Cada 1' Por 7'\n\n5 Deadlift\n5 Hang Clean\n5 Front Squats\n5 Burpees\n\nForça - Squat Snatch\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Squat Snatch', details: "Amrap 10'\n\n5 Hang Squats Cleans (50/35)\n30 D.U." },
      { id: '3', title: "Amrap 12'", details: '12 Zombie Crunches (20/15)\n12 Russian Twists\n12 Burpees To Plate' },
    ],
  },
  {
    date: '2026-12-04',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n30'' Runner Position\n\nWarm Up\n\nEmom 9'\n\n1 - 100m Run\n2 - 10 Step Ups\n3 - 12 Kb Snatchs\n\nForça - Panturrilha\n\n4 Rounds Of\n\n12/12 Panturrilha Unilateral Kb\n50 Estacionadas" },
      { id: '2', title: 'Running', details: '4 Rounds Of\n\n50m Knees High\n50m Frankestein\n12/12 Chutes Unilaterais\n50m Abduzindo' },
      { id: '3', title: "Emom 4'", details: '1 - 12 Double Kb Step Up Overs (22/16)\n2 - 12 Double Kb Snatch' },
    ],
  },
  {
    date: '2026-12-05',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-12-07',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' PVC Pass\n30'' OH Hold\n30'' Pesando\n15/15 Hip Tilt\n\nWarm Up\n\nA Cada 1' Por 6'\n\n5 Hang Snatchs\n5 OHS\n20 Barbell Hops\n\nForça - Power Clean\n\n15' Para Achar o PR" },
      { id: '2', title: 'Cluster', details: "Amrap 8'\n\n1-2-3-4-5-6-7...\n\nCluster (60/35)\nPull Up" },
      { id: '3', title: "For Time 4'", details: '3 Rounds Of\n100m Run\n6 Double Kb Front Squat (22/16)' },
    ],
  },
  {
    date: '2026-12-08',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Cotovelo No Hack\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n\nWarm Up\n\n4 Rounds Of - TC 6'\n\n50m Run\n2 Rope Ascent\n12 V-Ups\n30 Polichinelos\n\nForça - Rope Climb\n\n4 Rounds Of\n\n6 Biceps Diretos\n6/6 Puxadas Sentados" },
      { id: '2', title: 'Rope Climb', details: "Emom 12'\n\n1 - 1 Rope Climb\n2 - 8 Burpees Box Jump\n3 - 8 Double Kb Thruster (22/16)" },
      { id: '3', title: "Emom 12'", details: '1 - 50 D.U.\n2 - 70 Flutterkicks\n3 - 12 G2OH (20/15)' },
    ],
  },
  {
    date: '2026-12-09',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'WOD', details: "Amrap 30'\n\n50m Buddy Carry\n12 Burpees Over The Buddy Each\n12 Single Kb Lunges Sync (24/18)\n12 Single Kb Clean And Jerk Each" },
    ],
  },
  {
    date: '2026-12-10',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Sentado No Solo\n30'' Mão Em Cada Pé\n30'' Punho No Solo\n30'' Bom Dia\n\nWarm Up\n\nA Cada 2' Por 8'\n\n100m Run\n6 Power Clean\n6 Front Squats\n6 BOTB\n\nForça - Power Snatch\n\n15' Para Achar o PR" },
      { id: '2', title: 'Split Jerk', details: "Amrap 9'\n\n1 Split Jerk\n5 Pull Ups" },
      { id: '3', title: "For Time 12'", details: '5 Rounds Of\n\n200m Run\n8 Thruster (60/35)\n12 BOTB' },
    ],
  },
  {
    date: '2026-12-11',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão A Frente No Solo\n12 Toques de Ombro No Solo\n\nWarm Up\n\nEmom 8'\n\n1 - 3 Rope Ascent\n2 - 30 Polichinelos\n3 - 10 Step Ups\n4 - 50 Escaladores\n\nForça - Biceps\n\n4 Rounds Of\n\n6 Biceps Inversos\n4 Peg Pull Up" },
      { id: '2', title: 'Peg Board', details: 'Passo a Passo' },
      { id: '3', title: "Emom 6'", details: '1 - 50 D.U.\n2 - 12 Box Jump Overs\n3 - 50 Escaladores' },
    ],
  },
  {
    date: '2026-12-12',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade + Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Nutts', details: '10 HSPU\n15 Deadlifts (120/80)\n25 Box Jumps \n50 Pull Ups\n100 Wall Balls\n200 D.U.\n400m Run Plate' },
    ],
  },
  {
    date: '2026-12-14',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' PVC Pass\n30'' Mão Na Parede\n30'' Deitado no Ombro\n30'' Punho no Solo\n\nWarm Up\n\nA Cada 1' Por 7'\n\n5 Hang Snatchs\n10 Step Ups\n10 V-Ups\n\nForça - Split Jerk\n\n15' para achar o Pr" },
      { id: '2', title: 'Power Snatch', details: "Emom 9'\n\n1 - 6 Power Snatch (60/35)\n2 - 12 Wall Balls (20/16)" },
      { id: '3', title: "Amrap 5'", details: '6 Kb Step Ups (32/22)\n8 Kb Swings\n6 Burpees' },
    ],
  },
  {
    date: '2026-12-15',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Agachado\n30'' Pesando\n30'' Quads no Hack\n30'' Glúteo no Solo\n\nWarm Up\n\nEmom 6'\n\n1 - 8 Front Squats\n2 - 15 Sprawls\n\nForça - Quadríceps\n\n4 Rounds Of\n\n12 Cycling Squats\n12 Cossack Squats" },
      { id: '2', title: 'T2B', details: "4 Rounds Of\n\n150m Run\n14 T2B\n12/12 Kb Snatch (32/16)\n\nT.C 12'" },
      { id: '3', title: "Amrap 12'", details: '30 D.U.\n50 Escaladores\n50m Farm Walk (40/22)' },
    ],
  },
  {
    date: '2026-12-16',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility e Warm Up Específico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Árvore de Natal', details: 'Segredo' },
    ],
  },
  {
    date: '2026-12-17',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Mão A Frente No Solo\n30'' Punho No Solo\n12 Toques de Ombro No Solo\n15/15 Giros de Ombro\n\nWarm Up\n\nA Cada 3' Por 9'\n\n200m Run\n10 Shoulder Press\n10 BOTB\n12 Kb Swings\n\nForça - Squat Clean\n\n15' Para Achar o PR" },
      { id: '2', title: 'Squat Clean', details: "Amrap 6'\n\n4 Squat Cleans (80/55)\n4 Front Squats\n6 Reverse Burpees" },
      { id: '3', title: "For Time 13'", details: '1km Run\n30 Push Press (60/35)\n600m Run\n30 Deadlifts\n200m Run' },
    ],
  },
  {
    date: '2026-12-18',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Gluteo no Solo\n30'' Pesando Kb\n30'' Agachado Alternando Peso\n15/15 Hip Tilt\n\nWarm Up\n\nEmom 9'\n\n1 - 20 Reverse Lunges\n2 - 20 Agachamentos\n3 - 20 Sit Ups\n\nForça - Gluteo\n\n4 Rounds Of\n\n8/8 Bulgarian Squats\n8 Back Squats" },
      { id: '2', title: 'Não Tem', details: '-' },
      { id: '3', title: 'Liamar', details: "Amrap 25'\n\n18 Box Jump Over\n12 Power Snatch\n25 Wall Ball" },
    ],
  },
  {
    date: '2026-12-19',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Murph', details: '1.6km Run\n100 Pull Ups\n200 Push Ups\n300 Air Squats\n1.6km Run' },
    ],
  },
  {
    date: '2026-12-21',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' PVC Pass\n30'' OH Hold\n30'' Pesando\n30'' Good Morning\n\nWarm Up\n\nA Cada 1' Por 6'\n\n5 Hang Snatchs\n5 OHS\n10 Step Ups\n\nForça - Squat Snatch\n\n15' Para achar o PR" },
      { id: '2', title: 'Kb Snatch', details: "Emom 6'\n\n1 - 12 Double Kb Snatchs (22/16)\n2 - 12 Double Kb OHS" },
      { id: '3', title: "Amrap 9'", details: '12 Box Jumps\n12 Sit Ups\n12 HSPU' },
    ],
  },
  {
    date: '2026-12-22',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' PVC Pass Invertido\n15/15 PVC Pass Lateral\n30'' Mão a Frente No Solo\n12 Toques de Ombro No Solo\n\nWarm Up\n\nA Cada 1' Por 5'\n\n6 Shoulder Press\n6 BOTB\n10 Reverse Lunges\n10 Air Squats\n\nForça - Glúteo\n\n4 Rounds Of\n\n6 Back Squats Com Hold 3''" },
      { id: '2', title: 'Pistol', details: "Amrap 12'\n\n5 Strict Pull Ups\n10 Pistols\n12 Sprawls" },
      { id: '3', title: "For Time 6'", details: '600m Plate Run (20/15)' },
    ],
  },
  {
    date: '2026-12-23',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Amrap 30'", details: 'Duplas\n\n1 Round Each\n\n100m Sprint\n6 Pull Ups\n6 Wall Balls (20/16)\n6 Hang Power Clean (60/40)\n6 BOTB' },
    ],
  },
  {
    date: '2026-12-25',
    title: 'FECHADO',
    sessions: [],
  },
  {
    date: '2026-12-26',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-12-28',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Sentado No Solo\n30'' Mão Em Cada Pé\n15/15 Hip Tilt\n30'' Punho No Solo\n\nWarm Up\n\nEmom 8'\n\n1 - 10 Deadlifts\n2 - 8 Hang Clean\n3 - 50 S.U.\n4 - 5 Strict Pull Ups" },
      { id: '2', title: 'SDHP', details: "Passo a Passo\n\nThen\n\nAmrap 7'\n\n1-2-3-4-5-6-7-8-9-...\nSDHP\nBOTB" },
      { id: '3', title: "For Time 12'", details: '3 Rounds Of\n\n20m Double Kb Walking Lunge (22/16)\n20 Pull Ups\n20 Double Kb Deadlifts\n20 Burpees' },
    ],
  },
  {
    date: '2026-12-29',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Agachado\n30'' Pesando\n30'' Puxando Pé Atras\n15/15 Hip Tilt\n\nWarm Up\n\nEmom 9'\n\n1 - 20 Reverse Lunges\n2 - 20 Air Squats\n3 - 10 Step Ups" },
      { id: '2', title: 'HSW', details: "Emom 8'\n\n1 - 5 Hang Squat Snatch (60/35)\n2 - 10m HSW" },
      { id: '3', title: "Amrap 9'", details: 'By In\n\n1km Run\n\nMax de Burpee' },
    ],
  },
  {
    date: '2026-12-30',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento especifico' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: "For Time 30'\n600m Run\n30 Burpees Box Jump Over\n30 Db Snatchs (22/16)\n400m Run\n15 Burpees Box Jump Over\n15 Db Snatchs\n200m Run\n10 Burpees Box Jump Over\n10 Db Snatchs" },
    ],
  },
  {
    date: '2026-12-31',
    title: 'FECHADO',
    sessions: [],
  },
];

export default DEZEMBRO_2026;
