// Dados de treino — Julho 2026
// Encoding UTF-8 corrigido.
// Títulos normalizados: "LPO Day" → "LPO", "Gym Day" → "GYM", "METCON Day" → "METCON", "Hero Wod" → "HERO", "LEDESMA" → "HERO", "Interativo Em Dupla" → "INTERATIVO"
// 2026-07-13: "15â para achar o PR" corrigido para "15' para achar o PR"

import { SeedEntry } from './seed-abril-2026';

const JULHO_2026: SeedEntry[] = [
  {
    date: '2026-07-01',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'WOD', details: "For Time 30' - Duplas\n\n100 Deadlifts (60/45)\n100 Push ups\n100 Hang Cleans\n100 HSPU\n100 S2OH\n100 Squat\n\nThem\n\nMax Distance Run" },
    ],
  },
  {
    date: '2026-07-02',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Quads Na Parede\n30'' PVC Pass\n\n2 Rounds Of\n\n5 Hang Snatchs\n5 OHS\n50m Run\n\nForça - Front Squat\n\n15' Pra Achar o PR" },
      { id: '2', title: 'Deadlift', details: 'Passo a Passo pegado do Clean + Snatch + Sumo' },
      { id: '3', title: "Amrap 7'", details: 'Max Load OHS Saindo Do Chão\nAntes de Cada Tentativa 50m Sprint + 10 Jumping Squats' },
    ],
  },
  {
    date: '2026-07-03',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Gluteo No Solo\n\n2 Rounds Of\n10 Lunges\n10 Air Squats\n1' Front Plank\n\nForça - Fortalecimento De Joelhos\n4 Rounds Of\n20 Air Squats\n1' Agachado 90 Graus" },
      { id: '2', title: 'RMU', details: 'Dia 2 - Passo a Passo avançado começando da entrada na caixa' },
      { id: '3', title: "Emom 12'", details: '1 - 20 Russian Twists (22/16)\n2 - 12 Alternated T2B\n3 - 50 Heel Touch' },
    ],
  },
  {
    date: '2026-07-04',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'Kevin', details: '3 Rounds Of\n\n32 Deadlifts (185/125)\n32 Hanging Hp Touches\n800m Farm Carry' },
    ],
  },
  {
    date: '2026-07-06',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Quads Na Parede\n30'' PVC Pass\n\n2 Rounds Of\n\n5 Hang Snatchs\n5 OHS\n50m Run\n\nForça - Shoulder Press\n\n15' Pra Achar o PR" },
      { id: '2', title: 'Squat Snatch', details: 'Passo a Passo Focado em Velocidade de Entrada' },
      { id: '3', title: "Amrap 7'", details: 'Max Load OHS Saindo Do Chão\nAntes de Cada Tentativa 50m Sprint + 10 Jumping Squats' },
    ],
  },
  {
    date: '2026-07-07',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n\n2 Rounds Of\n\n10 Push Ups\n3 Wall Walks\n10 Sprawls\n\nForça - Triceps\n\n4 Rounds Of\n6 Triceps Testa\n15 Push Ups" },
      { id: '2', title: 'Handstand Walk - Dia 1', details: "Passo a Passo - Até Defesa\n\nQuem ja faz\n\n4 Rounds Of\n\n3 Wall Walks\n1' Front Plank" },
      { id: '3', title: "Amrap 5'", details: '6 Hanging Hip Touch\n8 Zombies\n6 Sprawls' },
    ],
  },
  {
    date: '2026-07-08',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'WOD', details: "Amrap 9'\n\n15 Wall Bals (20/14)\n12 T2B\n10 Burpees\n\nRest 1'\n\nAmrap 9'\n\n50 D.U./ 100 S.U.\n8 Devil Press (22/16)\n15 Kb Swings\n\nRest 1'\n\nFor Time 9'\n2km Run" },
    ],
  },
  {
    date: '2026-07-09',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n30'' Agachado\n30'' Pesando\n\n2 Rounds Of\n\n5 Deadlifts\n5 Hang Cleans\n5 Front Squats\n50m Run\n\nForça - OHS\n\n15' Pra Achar PR" },
      { id: '2', title: 'Kettlebel', details: 'Passo a Passo de Kb Clean, Kb Jerk e Kb Clean and Jerk' },
      { id: '3', title: "For Time 12'", details: '600m Run\n12 Clean And Jerk (60/45)\n20 Burpees OTB\n12 Clean And Jerks\n600m Run' },
    ],
  },
  {
    date: '2026-07-10',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' PVC Pass\n30'' Agachado\n30'' Pesando\n\n2 Rounds Of\n\n3 Wall Walks\n5 Front Squats\n5 Shoulder Press\n\nForça - Estabilizadores De Ombro\n\n4 Rounds Of\n6/6 Desenvolvimentos de Ombro Kb Invertido\nIda e Volta Kb Invertido" },
      { id: '2', title: 'Handstand Walk - Dia 2', details: "Passo a Passo Guiado Até Andar\n\nQuem Não Vira\n\nAmrap 12'\n\n100m Run\n10 Cachorros Mancos\n10 Push Ups" },
      { id: '3', title: "Emom 12'", details: '1 - 6 Thrusters (50/35)\n2 - 8 BOTB\n3 - 10 Pull Ups' },
    ],
  },
  {
    date: '2026-07-11',
    title: 'FESTA JUNINA',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-07-13',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Agachado Em OH\n30'' Pesando\n30'' Pé Na Parede\n\n2 Rounds Of\n\n5 Shoulder Press\n5 OHS\n10 Ring Row\n50m Run\n\nForça - Bench Press\n\n15' para achar o PR" },
      { id: '2', title: 'Split Jerk', details: 'Passo a Passo Guiado' },
      { id: '3', title: "Emom 12'", details: '1 - 30 Escaladores\n2 - 10 Pull Ups\n3 - 100m MB Run\n4 - 15 Wall Balls (20/16)' },
    ],
  },
  {
    date: '2026-07-14',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n30'' Mão No Solo\n12 Toques de Ombro No Solo\n\n2 Rounds Of\n\n50m Run\n10 Ring Row\n10 Push Ups\n\nForça - Ring\n\n5 Rounds Of\n15 Hollow Rocks\n12 V-ups" },
      { id: '2', title: 'T2R', details: 'Passo a Passo Guiado' },
      { id: '3', title: "For Time 6'", details: '1km Run\n20 Burpees Abroad' },
    ],
  },
  {
    date: '2026-07-15',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Mini Blocos de Benchmark 30'", details: "For Time 6'\n21-15-9\nPower Clean (60/45)\nRing Dip\n\nRest 1'\n\nFor Time 4'\n30 Snatchs\n\nRest 1'\n\nFor Time 8'\n50-40-30-20-10\nD.U.\nSit Ups\n\nRest 1'\n\nFor Time 9'\n21-15-9\nDeadlift (100/70)\nHSPU" },
    ],
  },
  {
    date: '2026-07-16',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' Agachado\n30'' Pesando\n30'' Girando Braço em Cada Direção\n\n2 Rounds Of\n\n10 Air Squats\n10 Sit Ups\n\nForça - Push Press\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Overhead Squat', details: 'Correção Postural, Amplitude, Mobilidade\n\nThem\n\nBring Sally OHS' },
      { id: '3', title: "Emom 6'", details: '1 - 15 Wall Balls (20/16)\n2 - 15 V-Ups\n3 - 15 Mb Power Cleans' },
    ],
  },
  {
    date: '2026-07-17',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Cotovelo No Hack\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n\n2 Rounds Of\n\n2 Rope Ascent\n10 Shoulder Tap Front Plank\n10 Sit Ups\n5 Burpees\n\nForça - Rope Climb\n\n5 Rounds Of\n1 Legless - 6 Puxadas\n1 Rope Climb - 6 Clips" },
      { id: '2', title: 'Rope Climb', details: "Passo a Passo Guiado\n\nQuem Já Faz - Emom 15'\n\n1 - 8 Devil Press (22/16)\n2 - 150m Run\n3 - 1 Rope Climb" },
      { id: '3', title: "Amrap 13'", details: '8 Hanging Shoulder Tap\n8 T2B\n8 Burpees To Target' },
    ],
  },
  {
    date: '2026-07-18',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'LEDESMA', details: "Amrap 20'\n\n5 Parallete HSPU\n10 Toes Through Ring\n20 MB Cleans" },
    ],
  },
  {
    date: '2026-07-20',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão Na Parede\n30'' Punho Na Parede\n\n2 Rounds Of\n\n10 Hang clean\n10 Shoulder press\n\nForça - Power Balance\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Clean and Jerk', details: 'Passo A Passo Guiado' },
      { id: '3', title: "Emom 12'", details: '1 - 8 Floor Press (60/45)\n2 - 150m Sprint\n3 - Rest' },
    ],
  },
  {
    date: '2026-07-21',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão No Solo\n\n2 Rounds Of\n\n10 Ring Row\n10 Sit Ups\n50m Run\n\nForça - Bar Muscle Up\n\n5 Rounds Of\n\n6 a 12 Strict Pull Ups\n6 a 12 Pull Overs Suspensos" },
      { id: '2', title: 'Bar Muscle Up - Dia 1', details: "Passo a Passo Guiado Solo e Caixa\n\nQuem Já Faz - Amrap 12'\n\n3 Bar Muscle Ups\n12 Jumping Lunges\n100m Sprint" },
      { id: '3', title: "Amrap 5'", details: 'Max T2B\n\nEach Break 5 Burpees' },
    ],
  },
  {
    date: '2026-07-22',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30'", details: '600m Mb Run (20/16)\n\n3 Rounds Of\n\n12 Deadlifts (60/45)\n6 Power Clean\n12 Front Squats\n\n600m Mb Run\n\n3 Rounds Of\n\n12 Deadlifts (60/45)\n6 Power Clean\n12 Front Squats\n\n600m Mb Run' },
    ],
  },
  {
    date: '2026-07-23',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Quads Na Parede\n\n2 Rounds Of\n\n5 Deadlifts\n5 Hang Clean\n5 Front Squats\n5 Shoulder Press\n\nForça - Clean Pull\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Squat Clean', details: 'Passo a Passo Guiado' },
      { id: '3', title: "Amrap 5'", details: '6 Plate Thruster (20/15)\n6 Burpees To Plate' },
    ],
  },
  {
    date: '2026-07-24',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n\n2 Rounds Of\n\n10 Ring Row\n5 Burpees\n50m Run\n\nForça - Dorsal\n\n4 Rounds Of\n\n6 a 12 Remadas Curvadas\n6 a 12 Pull Ups" },
      { id: '2', title: 'Bar Muscle Up Dia 2', details: "Passo A Passo Guiado Suspenso\n\nQuem Não Entrou Na Caixa - Amrap 12'\n100m Run\n10 Ring Row\n10 Push Ups\n\nQuem Já Faz - 1x Max BMU Unbk\n              3x 60%" },
      { id: '3', title: "For Time 12'", details: '10 Rounds Of\n50m Mb Run (20/16)\n8 Burpees' },
    ],
  },
  {
    date: '2026-07-25',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-07-27',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobilidade + Warm Up\n\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n30'' Mão Na Parede\n\n2 Rounds Of\n\n5 Deadlifts\n5 Remadas Altas\n5 Burpees\n30 Polichinelos\n\nForça - Snatch Pull\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Kb Snatch', details: "Passo a Passo\n\nThem\n\nAmrap 7'\n\n1-2-3-4-5-6-7-8-9-...\nDouble Kb Snatch (22/16)\nDouble OH Lunge" },
      { id: '3', title: "Amrap 12'", details: '8 Double Devil Press (22/16)\n50 D.U.\n10 Pull Ups' },
    ],
  },
  {
    date: '2026-07-28',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobilidade + Warm Up\n\n30'' Mão Na Parede\n30'' PVC Pass\n30'' Punho Na Parede\n30'' Deitado No Ombro\n\n2 Rounds Of\n\n10 Cachorros Mancos\n20 Sit Ups\n40'' Front Plank\n\nForça - Estabilização de Ombro\n\n5 Rounds Of\n40'' OH Hold\n12 Shoulder Tap In Front Plank" },
      { id: '2', title: 'HSPU - Dia 1', details: "Passo a Passo Guiado Até a descida\n\nPra Quem Já Faz de forma consistente\n\nAmrap 12'\n\n10 HSPU\n6 Hang Power Clean (50/35)\n6 Front Squats" },
      { id: '3', title: "Amrap 4'", details: 'Max V-Ups\n\na cada quebra 5 reverse burpee' },
    ],
  },
  {
    date: '2026-07-29',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30'", details: "1 - 3 Power Clean + 4 Front Squats (60/45)\n2 - 4 Push Jerks + 6 BOTB\n3 - 6 Box Jump Overs + 6 T2B\n4 - 30 D.U. + 12 Jumping Squats\n5 - Rest" },
    ],
  },
  {
    date: '2026-07-30',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobilidade + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Gluteo No Solo\n\n2 Rounds Of\n\n10 Air Squats\n5 Burpees\n10 Step Ups\n\nForça - Snatch High Pull\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Kb Clean And Jerk', details: "Passo a Passo\n\nThem\n\nEmom 6'\n\n1 - 8 Double Kb Clean And Jerk (22/16)\n2 - 8 Double Kb Front Squats" },
      { id: '3', title: "Emom 6'", details: '1 - 10  Box Jump Overs\n2 - 12 T2B' },
    ],
  },
  {
    date: '2026-07-31',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobilidade + Warm Up\n\n30'' Pé Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' PVC Pass Lateral\n\n2 Rounds Of\n\n3 Wall Walks\n10 Step Ups\n5 Hang Snatchs\n\nForça - Ombro\n\n4 Rounds Of\n6 a 12 Push Press\n6 a 12 Abduções de Ombro" },
      { id: '2', title: 'HSPU Dia 2', details: "Passo a Passo Pra Andar\n\nPra Quem Nao Virou Sozinho No Dia 1\n\nEmom 15'\n\n1 - 150m Run\n2 - 12 Burpees\n3 - Rest\n\nPra Quem Já Faz\n\nFor Time 15'\n\n4 Rounds Of\n6 Thruster (40/25)\n10 HSPU\n6 BOTB" },
      { id: '3', title: "For Time 12'", details: '1-2-3-4-5-6-7-8-9-10-9-8-7-6-5-4-3-2-1\nPower Snatchs (50/35)\nJump Bar' },
    ],
  },
];

export default JULHO_2026;
