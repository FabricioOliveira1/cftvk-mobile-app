// Dados de treino — Novembro 2026
// Encoding UTF-8 corrigido. "â" corrigido para '' (segundos) ou ' (minutos) conforme contexto.
// Títulos normalizados: "LPO Day" → "LPO", "Gym Day" / "GYM Day" → "GYM", "Metcon Day" / "METCON Day" → "METCON", "Hero Day" → "HERO", "Interativo" → "INTERATIVO"
// 2026-11-02: FECHADO — ignorado pela função
// 2026-11-17: "150n Run" corrigido para "150m Run"
// 2026-11-27: "A Cara 2' Por 8'" corrigido para "A Cada 2' Por 8'"

import { SeedEntry } from './seed-abril-2026';

const NOVEMBRO_2026: SeedEntry[] = [
  {
    date: '2026-11-02',
    title: 'FECHADO',
    sessions: [],
  },
  {
    date: '2026-11-03',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Cotovelo No Hack\n30'' PVC Pass\n30'' Girando Ombro\n\n2 Rounds Of\n\n20 Sit Ups\n10 Push Ups\n20 Escaladores\n\nForça - Core\n\n5 Rounds Of\n\n12 Russian Twists\n20 V-Ups Alternados" },
      { id: '2', title: 'Rope Climb', details: "Passo a Passo\n\nQuem já faz\n\nAmrap 12'\n\n20 Reverse Lunge Kb\n1 Rope Climb\n30 Escaladores" },
      { id: '3', title: 'Tabata', details: 'Tabata Flutterkick\n\nThen\n\nTabata Back Extension' },
    ],
  },
  {
    date: '2026-11-04',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30' - Duplas", details: '1 - Max Air Squat e Chair Hold\n2 - Max Push Up e Prancha\n3 - Max T2B e Hold\n4 - Max Run Juntos\n5 - Rest' },
    ],
  },
  {
    date: '2026-11-05',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Puxando Pé Atras\n30'' Gluteo No Solo\n\n2 Rounds Of\n\n10 Air Squats\n5 Hang Snatchs\n5 Burpees\n\nForça - Power Snatch\n3x2- 80%\n2x2- 85%\n2x3- 90%" },
      { id: '2', title: 'Power Clean', details: 'Passo a Passo' },
      { id: '3', title: "Emom 4'", details: '1 - 14 Kb Snatchs (22/16)\n2 - 20 OH Lunges' },
    ],
  },
  {
    date: '2026-11-06',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Girando Ombro\n\n2 Rounds Of\n\n10 V-Ups\n30 Polichinelos\n10 Push Ups\n\nForça - Core\n\n5 Rounds Of - Duplas\n\n10 GHD Sit Ups\n6 Zombie Crunch" },
      { id: '2', title: 'T2B', details: "Passo a Passo\n\nQuem Já Faz\n\nAmrap 12'\n\n20 T2B\n6 Strict Pull Ups\n3 BMU" },
      { id: '3', title: "Amrap 12'", details: '50 Escaladores\n100 Estacionadas\n50m Sprint\n10 Sprawls' },
    ],
  },
  {
    date: '2026-11-07',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-11-09',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n15/15 PVC Pass Lateral\n30'' Agachado\n30'' Pesando\n30'' Elevando Cotovelo No Hack\n\n2 Rounds Of\n\n5 Hang Clean\n5 Front Squats\n5 Shoulder Press\n10 Deep And Drive\n\nForça - Split Jerk\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Push Jerk', details: 'Passo a Passo' },
      { id: '3', title: "Emom 12'", details: '1 - 20 Wall Balls (20/16)\n2 - 6 Thruster (50/35)\n3 - 5 BMU' },
    ],
  },
  {
    date: '2026-11-10',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' PVC Pass\n\n2 Rounds Of\n\n3 Strict Pull Ups\n12 V-Ups\n30 Polichinelos\n\nForça - Pull Up\n\n4 Rounds\n\n6 a 8 Strict Pull Ups\n6 a 12 Remadas Serrotes Supinadas" },
      { id: '2', title: 'Pull Up', details: "Passo a Passo Solo e Linha Suspensa\n\nQuem já faz:\n\n3 Rounds Of\n\n10 Pull Ups\n50 D.U\n12 Double Kb Snatchs (22/16)" },
      { id: '3', title: "Emom 6'", details: '1 - 15 T2B\n2 - 50 Escaladores\n3 - 8 Double Kb Clean And Jerk (22/16)' },
    ],
  },
  {
    date: '2026-11-11',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não tem' },
      { id: '3', title: "For Time 30'", details: '200 D.U.\n30 Power Snatch (60/35) Simultâneo 30 OHS\n150 D.U.\n50 Pull Ups Simultâneos 50 Ring Row\n100 D.U.\n30 Power Cleans Simultâneos 30 Front Squats\n50 D.U.\n50 HSPU Simultâneos 50 Push Ups\n\nThem\n\nMax Dist Run Juntos' },
    ],
  },
  {
    date: '2026-11-12',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta No Solo\n30'' Mão em Cada Pé\n30'' Quadril No Solo\n30'' Cossack Hold\n\n2 Rounds Of\n\n5 Remadas Altas\n5 Hang Snatchs\n5 OHS\n20 Sit Ups\n\nForça - Squat Clean\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Hang Squat Snatch', details: 'Passo a Passo' },
      { id: '3', title: "Amrap 6'", details: '8 Step Up Over Kb (22/16)\n12 Russian Twists\n6 HSPU' },
    ],
  },
  {
    date: '2026-11-13',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Girando Ombro\n\n2 Rounds Of\n\n3 Strict Pull Ups\n10 Plate Floor Press\n20 Line Hops\n\nForça - Pull Up\n\n4 Rounds Of\n\n12 Pull Ups\n6 a 8/ 6 a 8 Remadas Serrotes" },
      { id: '2', title: 'Pull Up', details: "Passo a Passo Avançado\n\nQuem já faz:\n\n1-2-3-4-5-6-7-8-9...\nPull Up\nFloor Press (60/35)" },
      { id: '3', title: "For Time 12'", details: '4 Rounds Of\n\n150m Run\n8 Sumo Deadlifts (80/60)\n40 Barbell Hops' },
    ],
  },
  {
    date: '2026-11-14',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Matt 16', details: '16 Deadlifts ( 275/185 )\n16 Hang Power Clean ( 185/ 125 )\n16 Push Press (135/ 95)\n800m Run\n16 Deadlifts\n16 Hang Power Cleans\n16 Push Press\n800m Run\n16 Deadlifts\n16 Hang Power Cleans\n16 Push Press' },
    ],
  },
  {
    date: '2026-11-16',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Perna Aberta de Pé\n30'' Tocando Atrás e Extendendo\n30'' Abraçando Pernas de Pé\n30'' PVC Pass\n\nWarm Up\n\nA Cada 1' Por 7'\n\n5 Hang Snatchs\n5 Shoulder Press BN\n30 Escaladores\n\nForça - Squat Snatch\n\n3x2 - 80%\n2x3 - 85%\n2x2 - 90%" },
      { id: '2', title: 'Split Jerk', details: 'Passo a Passo' },
      { id: '3', title: "Emom 8'", details: '1 - 12 Zombie Crunches (20/15)\n2 - 50 D.U.\n3 - 12 Kb Swings (22/16)\n4 - 12 Russian Twists (22/16)' },
    ],
  },
  {
    date: '2026-11-17',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Tocando Ombro No Solo\n30'' Mão a Frente No Solo\n\nWarm Up\n\nFor Time 7'\n\n3 Rounds Of\n\n2 Rope Ascent\n50m Run\n3 Wall Walks\n\nForça - Biceps\n\n4 Rounds Of\n\nBíceps 21" },
      { id: '2', title: 'Peg Climb', details: 'Passo a Passo' },
      { id: '3', title: "Amrap 12'", details: '10m HSW\n1 Peg Climb\n150m Run' },
    ],
  },
  {
    date: '2026-11-18',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Específicos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30'", details: 'Duplas\n\n4 Rounds Of\n\n100m Buddy Carry\n50 Deadlifts (60/35)\n30 Power Cleans\n20 S2OH\n10 BOTB Sync' },
    ],
  },
  {
    date: '2026-11-19',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Mão Na Parede\n30'' Girando Ombro\n30'' Punho No PVC\n30'' Punho Na Parede\n\nWarm Up\n\nA Cada 2' Por 8'\n\n5 Deadlifts\n5 Hang Clean\n5 Front Squat\n5 Shoulder Press\n10 Step Ups\n10 Push Ups\n\nForça - Power Clean\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Squat Clean', details: 'Passo a Passo' },
      { id: '3', title: "Amrap 15'", details: '10 Burpees Box Jump Over\n12 Double Kb Hang Clean (22/16)\n5 Wall Walks' },
    ],
  },
  {
    date: '2026-11-20',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Puxando Braço Do Colega Atrás\n30'' Pidgeon Pose\n\nWarm Up\n\nEmom 9'\n\n1 - 4 Rope Ascent\n2 - 40'' Front Plank\n3 - 40'' Single Under\n\nForça - Biceps\n\n4 Rounds Of\n\n6 Bíceps Inversos\n20'' Hold 90 Graus" },
      { id: '2', title: 'Rope Climb', details: "Passo a Passo\n\nQuem Já Faz:\n\nAmrap 12'\n\n1 Rope Climb\n6 Strict Pull Ups\n8 Strict Dips" },
      { id: '3', title: "Emom 9'", details: '1 - 50 D.U.\n2 - 15 T2B\n3 - 150m Sprint' },
    ],
  },
  {
    date: '2026-11-21',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-11-23',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Agachado\n30'' Pesando\n30'' Good Morning\n30'' Punho No Solo\n30'' Elevando Cotovelo No Hack\n\nWarm Up\n\nBring Sally Front Squat\n\nForça - Power Snatch\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Squat Snatch', details: 'Passo a Passo' },
      { id: '3', title: "For Time 4'", details: '100 Air Squats' },
    ],
  },
  {
    date: '2026-11-24',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Puxando PVC Do amigo Deitado\n30'' Punho No Solo\n30'' Pidgeon Pose\n30'' Tocando Ombro No Solo\n\nWarm Up\n\nA Cada 1' Por 6'\n\n10 Cachorros Mancos\n10 Pike Push Ups\n5 Front Squats\n\nForça - Triceps\n\n4 Rounds Of\n\n6 a 8 Tríceps Francês KB\n12 Diamond Push Ups" },
      { id: '2', title: 'HSPU', details: "Passo a Passo\n\nQuem já faz:\n\nFor Time 12'\n\n5 Rounds Of\n\n6 Déficit HSPU\n6 Man Maker (22/16)" },
      { id: '3', title: "Emom 12'", details: '1 - 8 Front Squats (60/40)\n2 - 10 BOTB\n3 - 30 Barbell Hops' },
    ],
  },
  {
    date: '2026-11-25',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Específicos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30'", details: '1 - 8 Thruster (50/35)\n2 - 6 BMU\n3 - 8 Shuttle Run\n4 - 12 Goblet Squat (32/22)\n5 - Rest' },
    ],
  },
  {
    date: '2026-11-26',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Punho No PVC\n30'' PVC Pass\n30'' Oh Hold\n30'' Pesando\n\nWarm Up\n\nEmom 8'\n\n1 - 8 Hang Snatchs\n2 - 10 OHS\n3 - 12 Sprawls\n4 - 15 V-Ups\n\nForça - Split Jerk\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Deadlift', details: 'Passo a Passo' },
      { id: '3', title: "Amrap 11'", details: '6 Devil Press (22/16)\n20 Frankstein\n6 Thruster R-Arm\n6 Thruster L-Arm' },
    ],
  },
  {
    date: '2026-11-27',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Cotovelo No Hack\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão Na Parede\n\nWarm Up\n\nA Cada 2' Por 8'\n\n10 Plate Floor Press\n10 Push Ups\n10 V-Ups\n40'' Front Plank\n\nForça - Triceps\n\n4 Rounds Of\n\n6 a 8 Floor Press\n8 a 10 Loaded Push Ups" },
      { id: '2', title: 'HSPU', details: "Passo a Passo Avançado\n\nQuem Já Faz:\n\nAmrap 12'\n\n8 HSPU\n6 Deadlifts (100/70)\n100m Run\n\nQuem Não Vira:\n\nAmrap 12'\n\n10 Push Ups\n6 Deadlifts\n100m Run" },
      { id: '3', title: "Amrap 3'", details: 'Max Shoulder Tap\n\nEach Break 5 Burpees' },
    ],
  },
  {
    date: '2026-11-28',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Nickman', details: '10 Rounds Of\n\n200m Farm Walk (32/16)\n10 Pull Ups\n20 Power Snatch Alternado' },
    ],
  },
  {
    date: '2026-11-30',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility\n\n30'' Perna Aberta No Solo\n30'' Mão em Cada Pé\n30'' Punho No Solo\n30'' Elevando Cotovelo no Hack\n\nWarm Up\n\nA Cada 1' Por 8'\n\n6 G2OH Plate\n6 Burpees To Plate\n50m Plate Run\n\nForça - Squat Clean\n\n2x3 - 85%\n2x2 - 90%\n4x1 - 95%" },
      { id: '2', title: 'Power Snatch', details: 'Passo a Passo' },
      { id: '3', title: "Emom 6'", details: '1 - 20 Mb Clean (20/16)\n2 - 100m MB Run' },
    ],
  },
];

export default NOVEMBRO_2026;
