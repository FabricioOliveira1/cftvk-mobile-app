// Dados de treino — Abril 2026
// Gerado automaticamente. Encoding UTF-8 corrigido.
// 2026-04-04 (FECHADO) omitido intencionalmente.
// 2026-04-10: titulo corrigido de "a" → "GYM" (erro de digitação na origem).

export interface SeedSession { id: string; title: string; details: string; }
export interface SeedEntry   { date: string; title: string; sessions: SeedSession[]; }

const ABRIL_2026: SeedEntry[] = [
  {
    date: '2026-04-01',
    title: 'Meticon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Liberação Miofascial + Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não tem' },
      { id: '3', title: "Emom 30'", details: "RX\n\nA cada 9' Por 30'\n\n600m Run\n12 Push Jerks (60/40)\n12 Burpees Over The Bar\n12 Box Jump Overs\n100m Farm Walk (40/24)\n12 Russian Kb Swings\n\nRest 1' Entre" },
    ],
  },
  {
    date: '2026-04-02',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n30'' PVC Pass\n30'' Mão No Solo a Frente\n12 Toques de Ombro no Solo\n\n5 Hang Clean\n30 Polichinelos\n10 Ring Row\n\nForça- Split Jerk - TC. 15'\n\nPR" },
      { id: '2', title: 'Hang Power Clean', details: "For Time 8'\n\n50 Hang Power Clean\nEach break 12 Encolhimentos de Ombro KB" },
      { id: '3', title: "For Time 11'", details: "RX\n\n100 D.U.\n10 Pull Ups\n80 D.U.\n15 Pull Ups\n60 D.U.\n20 Pull Ups\n40 D.U.\n25 Pull Ups\n20 D.U.\n30 Pull Ups\n\nScaled\n\n200 S.U.\n20 Ring Row\n160 S.U.\n30 Ring Row\n120 S.U.\n20 Ring Row\n80 S.U.\n25 Ring Row\n20 S.U.\n30 Ring Row" },
    ],
  },
  {
    date: '2026-04-03',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' PVC Pass Lateral\n30'' Deitado no Ombro\n30'' Deitado no Ombro Invertido\n\n2 Rounds Of\n\n10 Ring Row\n10 Air Squats\n5 Burpees\n\nPotência BMU\n\n4 Rounds\n\n4 Entradas da Caixa\n4 Toques de Quadril na Barra" },
      { id: '2', title: 'BMU', details: "Dia 2 - Passo a Passo Avancado pra quem entrou da caixa solo\n\nOu\n\nRx/ Condicionamento\nEmom 12'\n\n1 - 3 BMU/ 3 Tentativas da Caixa\n2 - 12 Burpees To Target\n3 - Rest" },
      { id: '3', title: "Amrap 5'", details: 'Categoria Única\n\nMax Air Squat Unbk\nEach Break 10 Burpees' },
    ],
  },
  // 2026-04-04 FECHADO — omitido
  {
    date: '2026-04-06',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Warm Up + Mobility\n\n30'' Agachado em OH\n30'' Pesando\n30'' PVC Pass\n\n2 Rounds Of\n\n20 Lunges\n10 Push Ups\n10 Bom Dias\n\nForça - Back Squat\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Deadlift', details: 'Passo a Passo pegada do clean, do snatch e do HP' },
      { id: '3', title: 'WOD', details: "RX\n\nEmom 6'\n\n1 - 20 Wall Balls (20/14)\n2 - 12 HSPU\n3 - 20m Walking Lunge\n\nScaled\n\nEmom 6'\n\n1 - 20 Wall Balls (16/12)\n2 - 12 Push up\n3 - 20m Walking Lunge" },
    ],
  },
  {
    date: '2026-04-07',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Warm Up + Mobility\n\n30'' Mão Na Parede\n30'' Punho No Solo\n12 Toques de Ombro No Solo\n\n10 Ring Row\n10 Sit Ups\n5 Burpees\n\nForça - Ombros\n4'' Concentrica - 2'' Iso - 4'' Excentrica\n\n4 Rounds Of\n6 Abdução de Ombros\n12 Flexões Alternadas De Ombro" },
      { id: '2', title: 'Pull Up', details: 'Fran com Kb \n\n21-15-9\n\nKb Thruster\nPull up' },
      { id: '3', title: "Amrap 10'", details: "RX\n\n12 T2B\n6 Burpees Box Jump Over\n12 Double Kb Push Press (22/16)\n\nIntermediario\n\n12 Knees to Elbow\n6 Burpees Box Jump Over\n12 Double Kb Push Press (20/14)\n\nScaled\n\n12 Knees High\n6 Burpees step up over\n12 Double Kb Push Press (18/12)" },
    ],
  },
  {
    date: '2026-04-08',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Amrap 30'", details: "Duplas Rx\n\n200 D.U.\n30 Clean And Jerks (60/40)\n30 Deadlifts\n30 Burpees OTB\n200m Run\n\nDuplas Scaled\n\n400 S.U.\n30 Clean And Jerks (50/30)\n30 Deadlifts\n30 Burpees OTB\n200m Run" },
    ],
  },
  {
    date: '2026-04-09',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Sentado No Calcanhar\n\n5 Deadlifts\n5 Hang Clean\n50m Run\n\nForça - Deadlift\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Kb Snatch', details: 'Passo a Passo + Progressão de carga para 5 reps' },
      { id: '3', title: "Emom 12'", details: '1 - 40 Escaladores\n2 - 6 Front Squats (60/45)\n3 - 150m Run' },
    ],
  },
  {
    date: '2026-04-10',
    title: 'GYM', // corrigido de "a"
    sessions: [
      { id: '1', title: 'Warm-up', details: "Warm Up + Mobility\n\n30'' Flexores de Punho Na Barra\n30'' PVC Pass Lateral\n\n2 Rounds Of\n\n10 Ring Row\n100m Run\n\nForça - Trapezio\n\n4 Rounds Of\n50m Farm Walk\n12 Encolhimentos" },
      { id: '2', title: 'HSPU', details: "Amrap 12'\n\n8 Push Press\n10 HSPU\n50m Farm Walk" },
      { id: '3', title: "For Time 5'", details: 'Rx\n\n600m Run\n12 Pull ups\n10 Burpees\n\nScaled\n\n400m Run\n24 Ring Row\n10 Burpees' },
    ],
  },
  {
    date: '2026-04-11',
    title: 'Hero',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'Jennifer', details: "Amrap 26'\n\n10 Pull Ups\n15 Kb Swings\n20 Box Jumps" },
    ],
  },
  {
    date: '2026-04-13',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Punho No Solo\n\n2 Rounds Of\n5 Deadlifts\n5 Front Squats\n5 Push Press\n\nForça - Front Squat\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Hang Squat Snatch', details: "Amrap 6'\n\n1 Hang Squat Snatch\n5 HSPU\n2 Hang Squat Snatch\n5 HSPU\n3 Hang Squat Snatch\n..." },
      { id: '3', title: "For Time 12'", details: '4 Rounds\n\n400m Run\n20 Box jumps\n20 Wall Balls' },
    ],
  },
  {
    date: '2026-04-14',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n\n30 Polichinelos\n10 Push Ups\n10 Sit Ups\n5 Burpees\n\nForça - Triceps\n\n4 Rounds Of\n\n12 Triceps Frances\n12 Push Ups" },
      { id: '2', title: 'HSPU', details: 'Passo a Passo dia 1\n\nDia 1 - Passo a Passo Guiado ( Linhas No Solo, Ambientação de Wall Walk e Dominio da Virada )\n\nQuem Já Faz\n\n21-15-9\nDeadlift \nHSPU' },
      { id: '3', title: "Emom 9'", details: 'RX\n\n1 - 50 D.U.\n2 - 12 T2B\n3 - 12 Burpees\n\nScaled\n\n1 - 100 S.U.\n2 - 12 Knees High\n3 - 12 Vups' },
    ],
  },
  {
    date: '2026-04-15',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30'", details: "A Cada 5' Por 30'\n\n400m Run\n6 Power Snatch (50/35)\n6 OHS\nMax Sit Up" },
    ],
  },
  {
    date: '2026-04-16',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' Punho No Solo\n30'' Mão A Frente No Solo\n\n5 Deadlifts\n5 Shoulder Press\n20 Line Hops\n10 Ring Row\n\nForça - Shoulder Press\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Push Jerk', details: "Amrap 6'\n\n1-2-3-4-5-6-7-...\nPush Jerk\nWall Walk" },
      { id: '3', title: "Amrap 12'", details: 'RX\n\n6 Deadlifts (100/70)\n20 Barbell Hops\n6 BMU\n\nIntermediario\n\n6 Deadlifts (80/60)\n20 Barbell Hops\n12 C2B\n\nScaled\n\n6 Deadlifts (60/40)\n20 Barbell Hops\n24 Pull ups' },
    ],
  },
  {
    date: '2026-04-17',
    title: 'Gym',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n\n2 Rounds Of\n\n10 Plate Floor Press\n20 Polichinelos\n50m Run\n\nForça - Peitoral\n\n4 Rounds Of\n\n12 Deadbug Press\n12 Wide Ring Row" },
      { id: '2', title: 'HSPU', details: 'Dia 2 - Passo a Passo Avançado para rx que precisa melhorar o movimento tambem\n\nPra Quem Não Está Pronto/ Rx que esteja com o movimento bom\n\nAmrap 12\'\n20 Push Ups / 10 HSPU\n20 Passadas Com Salto\n100m Run' },
      { id: '3', title: "Amrap 6'", details: '30 Polichinelos\n50 Estacionadas\n50m Sprint' },
    ],
  },
  {
    date: '2026-04-18',
    title: 'Interativo',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: 'Interativo' },
    ],
  },
  {
    date: '2026-04-20',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta Sentada\n30'' Mão Em Cada Pé\n30'' PVC Pass\n\n2 Rounds\n\n5 Deadlift\n5 Shoulder Press\n10 Sit Ups\n\nForça - OHS\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Kb Clean And Jerk', details: 'Passo a Passo Guiado' },
      { id: '3', title: "Emom 8'", details: '1 - 12 V-Ups\n2 - 15 Wall Balls (20/14)' },
    ],
  },
  {
    date: '2026-04-21',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Mão Na Parede\n\n5 Hang Cleans\n10 Sit Ups\n20 Lunges\n\nForça - Core\n\n4 Rounds Of\n\n12 Russian Twists\n12 L-Crunches" },
      { id: '2', title: 'T2B', details: "Emon 9'\n\n1- 15 T2B\n2- 20 V-ups\n3- Rest" },
      { id: '3', title: "Amrap 10'", details: '6 Power Cleans (70/45)\n20 Barbell Hops\n20 OH Lunges (22/16)' },
    ],
  },
  {
    date: '2026-04-22',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30'", details: '1km Run\n10 Front Squats (60/40)\n10 Wall Balls (20/14)\n600m Run\n20 Front Squats\n20 Wall Balls\n400m Run\n30 Front Squats\n30 Wall Balls\n200m Run\n40 Front Squats\n40 Wall Balls\n100m Run\n50 Front Squats\n50 Wall Balls' },
    ],
  },
  {
    date: '2026-04-23',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado em OH\n30'' Pesando\n30'' Pé Na Parede\n\n5 Hang Squat Snatch\n5 OHS\n100m Run\n\nForça - Bench Press\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Overhead Squat', details: 'Passo a Passo e trabalhar bem a mobilidade' },
      { id: '3', title: "For Time 15'", details: '3 Rounds Of\n\n400m Run\n20 Box Jumps\n12 Devil Press (22/16)' },
    ],
  },
  {
    date: '2026-04-24',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Pé Na Parede\n\n2 Rounds Of\n\n10 Air Squats\n10 Push Ups\n30 Polichinelos\n\nForça - Panturrilha\n\n4 Rounds Of\n\n12 Panturrilha Unilateral Na Plate Com Kb\n50 Estacionadas" },
      { id: '2', title: 'D.U', details: "T.C 12'\n\n5-10-15-20-30-35-40-45-50-45-40-35-30-25-20-15-10-5\n\nD.U Umbroken" },
      { id: '3', title: "For Time 10'", details: '150 Air Squats\n\nA cada quebra 5 burpees' },
    ],
  },
  {
    date: '2026-04-25',
    title: 'Hero',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'Jenny', details: "Amrap 20'\n\n20 OHS (45/25)\n20 Back Squats\n400m Run" },
    ],
  },
  {
    date: '2026-04-27',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta No Solo\n30'' Mão em Cada Pé\n30'' PVC Pass\n\n2 Rounds Of\n\n30 Polichinelos\n50 Estacionadas\n\nForça - Back Squat\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Split Jerk', details: "Amrap 7'\n\n1 Split Jerk\n5 Pull Ups" },
      { id: '3', title: "Emom 6'", details: '1 - 50 D.U.\n2 - 70 Polichinelos' },
    ],
  },
  {
    date: '2026-04-28',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' OH Hold\n30'' PVC Pass\n\n2 Rounds Of\n\n5 Hang Snatch\n5 OHS\n50m Sprint\n\nForça - Ombro\n\n6 Desenvolvimento Militar\n6 Abduções de Ombro" },
      { id: '2', title: 'HSW', details: 'Passo a Passo dia 1\n\nVirada, Ambientação, Contração' },
      { id: '3', title: "Amrap 6'", details: '50m Sprint\n1 Squat Snatch (80%)' },
    ],
  },
  {
    date: '2026-04-29',
    title: 'Metcon',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Aquecimento Especifico' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Emom 30'", details: '1 - 10 OHS (60/40)\n2 - 10 BOTB\n3 - 12 T2B\n4 - 150m Run\n5 - Rest' },
    ],
  },
  {
    date: '2026-04-30',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta no Solo\n30'' Mão Em Cada Pé\n30'' Mão Na Parede\n\n5 Deadlift\n5 Hang Cleans\n10 Push Ups\n10 Ring Row\n\nForça - Deadlift\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Power Clean', details: "Amrap 5'\n\n1-2-3-4-5-6-7-8-9-...\nPower Clean\nFront Squat" },
      { id: '3', title: "For Time 12'", details: '4 Rounds Of\n\n12 HSPU\n12 Pull Ups\n6 Power Cleans (70/45)' },
    ],
  },
];

export default ABRIL_2026;
