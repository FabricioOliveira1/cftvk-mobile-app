// Dados de treino — Outubro 2026
// Encoding UTF-8 corrigido. Aspas 30" e backticks normalizados para 30'' e '.
// Títulos normalizados: "LPO Day" → "LPO", "Gym Day" → "GYM", "Metcon Day" → "METCON", "Hero Day" → "HERO", "Interativo" → "INTERATIVO"
// 2026-10-31: FECHADO — ignorado pela função

import { SeedEntry } from './seed-abril-2026';

const OUTUBRO_2026: SeedEntry[] = [
  {
    date: '2026-10-01',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão a Frente No Solo\n12 Toques de Ombro No Solo\n30'' Punho No Solo\n15/15 Giros de Ombro Cada Direção\n\n2 Rounds Of\n\n5 Hang Clean\n5 Shoulder Press\n5 Front Squats\n10 Air Squats\n\nForça - Power Snatch\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Thruster e Cluster Diferença', details: 'Passo a Passo, Diferença' },
      { id: '3', title: "For Time 12'", details: '5 Kb Thrusters (22/16) Double Kb\n20 Barbell Hops\n5 BMU\n30 Mountain Climbers\n5 Rounds' },
    ],
  },
  {
    date: '2026-10-02',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Punho Na Parede\n30'' Cotovelo No Hack\n30'' PVC Pass\n\n2 Rounds Of\n\n10 Ring Row\n5 Deadlifts\n10 Push Ups\n\nForça - Ring Muscle Up\n\n4 Rounds Of\n\n6 a 8/ 6 a 8 Remadas Serrotes\n30'' Ring Balance" },
      { id: '2', title: 'Ring Muscle Up', details: "Passo a Passo Avancado\n\nQuem já faz:\n\n1x Max RMU\n3x 80%" },
      { id: '3', title: "Emom 12'", details: '1 - 20 Wall Balls (20/14)\n2 - 12 Zombie Plate Crunchs (20/15)\n3 - 70 Mountain Climbers' },
    ],
  },
  {
    date: '2026-10-03',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-10-05',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Deitado No Ombro\n30'' Deitado No Ombro Invertido\n30'' Mão A Frente No Solo\n12 Toques de Ombro No Solo\n\n2 Rounds Of\n\n10 Plate Floor Press\n10 Push Ups\n5 Deadlifts\n5 Hang Cleans\n\nForça - Split Jerk\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Power Snatch', details: 'Passo a Passo Com Carga' },
      { id: '3', title: "Emom 12'", details: "A Cada 2' Por 12'\n\n100m Sprint\n12 Wall Balls (20/16)\n20 Lunges" },
    ],
  },
  {
    date: '2026-10-06',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' PVC Pass\n15/15 PVC Pass Lateral\n\n2 Rounds Of\n\n10 Lunges\n5 Hang Snatchs\n5 Burpees\n\nForça - Pistol\n\n5 Rounds Of\n\n10/10 Box Pistols\n12 Jumping Squats" },
      { id: '2', title: 'Pistol', details: 'Só, Somente e Apenas Mobilidade' },
      { id: '3', title: "Amrap 5'", details: '5 Hang Snatchs (60/35)\n6 BOTB\n30 Escaladores' },
    ],
  },
  {
    date: '2026-10-07',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "Amrap 30'", details: 'Max Rounds\n\n5 Hang Power Clean (60/35)\n5 Front Squats\n5 HSPU\n1 Rope Climb\n\nEnquanto o Atleta 1 Faz o Outro Corre Max 2 Poste' },
    ],
  },
  {
    date: '2026-10-08',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Pé Na Parede\n30'' Puxando Pé Atras\n\n2 Rounds Of\n\n5 Deadlifts\n5 Hang Clean\n5 Front Squats\n50m Run\n\nForça - Squat Clean\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Snatch Pull e Snatch High Pull', details: 'Ativação de Quadril e Contato' },
      { id: '3', title: "Emom 6'", details: "A Cada 1' Por 6'\n\n50m Sprint\n5 Burpees\n5 Strict Pull Ups" },
    ],
  },
  {
    date: '2026-10-09',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Quadril No Solo\n30'' Perna Aberta No Solo\n30'' Mão Em Cada Pé\n\n2 Rounds Of\n\n10 Lunges\n10 Air Squats\n10 Ring Row\n\nForça - Pistol\n\n4 Rounds Of\n\n12 Barbell Reverse Lunges\n12 Goblet Squats" },
      { id: '2', title: 'Pistol', details: "Passo a Passo Guiado\n\nQuem Já Faz\n\nEmom 12'\n\n1 - 12 Pistols\n2 - 50 D.U.\n3 - Rest" },
      { id: '3', title: "For Time 12'", details: '4 Rounds Of\n\n20 Pull Ups\n6 Deadlifts (100/70)\n5 Wall Walks' },
    ],
  },
  {
    date: '2026-10-10',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Larry', details: '21-18-15-12-9-6-3\nFront Squat\nBOTB\n\n200m Mb Run Antes de Cada Rounds' },
    ],
  },
  {
    date: '2026-10-12',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta Parede (Duplas)\n30'' Mão Em Cada Pé\n30'' Bom Dia\n\n2 Rounds Of\n\n5 Deadlifts\n5 Hang Clean\n5 Shoulder Press\n5 Burpees\n\nForça - Squat Snatch\n\n4x2 - 70%\n3x3 - 75%\n3x2 - 80%" },
      { id: '2', title: 'Thruster', details: 'Passo a Passo' },
      { id: '3', title: 'Wod', details: "Tc 15'\n\n5 Rounds Of\n10 Thruster (43/29)\n10 C2B\n\nRest 1'\n\n5 Rounds Of\n\n7 Thruster (61/43)\n7 BMU" },
    ],
  },
  {
    date: '2026-10-13',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Pé Na Parede\n30'' Empurrando Pé Do Colega\n30'' Quads No Hack\n\n2 Rounds Of\n\n10 Step Ups\n5 OHS\n30 Polichinelos\n\nForça - Box Jumps\n\n5 Rounds Of\n\n12 Goblet Squats\n12 Line Tap (Linha Do Wall Ball)" },
      { id: '2', title: 'Box Jump', details: 'Passo a Passo E Conexão' },
      { id: '3', title: "For Time 6'", details: '8 Rounds Of\n\n6 OHS (60/35)\n50 D.U.' },
    ],
  },
  {
    date: '2026-10-14',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility + Warm Up Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Death By - Depende do Seu Esforço', details: "30' - Formato de Emom\n\nBurpee Box Jump Over\n\nFalhou\n\nBox Jump Over\n\nFalhou\n\nStep Up Over\n\nFalhou\n\nRun o que sobrar de tempo" },
    ],
  },
  {
    date: '2026-10-15',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Quads No Hack\n30'' Quadril No Solo\n\n2 Rounds Of\n\n5 Deadlifts\n5 Hang Clean\n5 Shoulder Press\n5 Back Squats\n\nForça - Power Clean\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'TGP', details: 'Passo a Passo' },
      { id: '3', title: "Amrap 4'", details: 'Max Time Double Kb Oh Hold\n\nEach Break\n\n10 Push Ups\n10 Shoulder Tap' },
    ],
  },
  {
    date: '2026-10-16',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Pé Na Parede\n30'' Empurrando Pé Do Amigo\n30'' Agachado\n30'' Pesando\n\n2 Rounds Of\n\n10 Step Ups\n10 Push Ups\n50m Run\n\nForça - Box Jump\n\n4 Rounds Of\n\n12 Step Ups Kb\n20 Jumping Squats" },
      { id: '2', title: 'Box Jump Over', details: 'Passo a Passo Guiado' },
      { id: '3', title: "Amrap 12'", details: 'Duplas\n\n400 Push Ups - Atleta 2 Em Prancha\n\nEach Break\n\n400m Run Juntos' },
    ],
  },
  {
    date: '2026-10-17',
    title: 'HERO',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Laura', details: "Duplas\n\n30 Cal Row\n20 Burpees OTRow\n10 Power Clean (155/105)\nAmrap 21'" },
    ],
  },
  {
    date: '2026-10-19',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Agachado\n30'' Pesando\n30'' Perna Aberta No Solo\n30'' Mão em Cada Pé\n\n2 Rounds Of\n\n5 Hang Clean\n5 Front Squats\n5 Shoulder Press\n\nForça - Power Snatch\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Hang Squat Clean', details: 'Passo a Passo Guiado' },
      { id: '3', title: "For Time 12'", details: '4 Rounds Of\n\n8 Cluster (60/35)\n12 Burpees Over The Bar\n20 Pull Ups' },
    ],
  },
  {
    date: '2026-10-20',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Mão Na Parede\n30'' Deitado no Ombro\n30'' Deitado No Ombro Invertido\n30'' Punho No Solo\n\n2 Rounds Of\n\n10 Cachorros Mancos\n5 Deadlifts\n5 Hang Clean\n5 Front Squats\n\nForça - HSW\n\n5 Rounds Of\n\n12 Shoulder TAP HS\n30'' HS Hold" },
      { id: '2', title: 'Handstand Walk Dia 1', details: "Passo a Passo Guiado até defesa\n\nQuem já anda\n\n4 Trys:\n\nCircuito Circular e Circuito Plates" },
      { id: '3', title: "Emom 6'", details: '1 - 12 Deadlifts (70/45)\n2 - 9 Hang Cleans\n3 - 6 Front Squats' },
    ],
  },
  {
    date: '2026-10-21',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobility e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: 'Transporte de Carga', details: "Amrap 30' - Em Grupos\n\n400m Farm Walk (40/22)\n100 Tire Flip\n600m Mb Run (30/20)\n50 Deadlifts (120/80)" },
    ],
  },
  {
    date: '2026-10-22',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' OH Hold\n30'' Pesando\n30'' Punho No Solo\n\n2 Rounds Of\n\n5 Hang Snatch\n5 OHS\n10 Step Ups\n30 Polichinelos\n\nForça - Split Jerk\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Hang Squat Snatch', details: 'Passo a Passo' },
      { id: '3', title: "For Time 10'", details: '1Km Run\n50 burpees\n600m Run' },
    ],
  },
  {
    date: '2026-10-23',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' PVC Pass\n30'' Mão Na Parede\n30'' Deitado no Ombro\n30'' Deitado no Ombro Invertido\n30'' Punho no Solo\n\n2 Rounds Of\n\n10 Cachorros Mancos\n10 Shoulder TAP\n20 Sit Ups\n\nForça - HSW\n\n4 Rounds Of\n\n40'' Double KB OH Hold\n10 Viradas ou Tentativas" },
      { id: '2', title: 'Handstand Walk Dia 2', details: "Passo a Passo Avançado\n\nQuem Não Virá\n\nAmrap 12'\n\n6 Tentativas\n100m Run\n10 Burpees\n\nQuem já anda\n\nCircuito HSW - Vou Montar" },
      { id: '3', title: "Emom 12'", details: '1 - 20 Wall Balls (20/14)\n2 - 20 Pull Ups\n3 - 12 Push Press (50/30)' },
    ],
  },
  {
    date: '2026-10-24',
    title: 'INTERATIVO',
    sessions: [
      { id: '1', title: 'Warm-up', details: '-' },
      { id: '2', title: 'Skill', details: '-' },
      { id: '3', title: 'WOD', details: '-' },
    ],
  },
  {
    date: '2026-10-26',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Deitado no Ombro\n30'' Deitado no Ombro Invertido\n30'' Punho No Solo\n12 Toque de Ombro No Solo\n\n2 Rounds Of\n\n10 Plate Floor Press\n10 Ring Row\n6 Inchworm\n\nForça - Squat Clean\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'OHS', details: 'Mobilidade, foco no postural sem prática' },
      { id: '3', title: "For Time 12' - Duplas Riley", details: '4 Rounds Of\n\n10 OHS (50/35)\n6 BOTB\n50 D.U' },
    ],
  },
  {
    date: '2026-10-27',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Pé na Parede\n30'' Puxando Pé Atrás\n30'' Agachado\n30'' Pesando\n\n2 Rounds Of\n\n10 Step Ups\n10 Agachamentos\n10 Russian KB Swing\n\nForça - Box Jump\n\n4 Rounds Of\n\n10 Kb Step Ups\n10 Agachamentos com Salto" },
      { id: '2', title: 'Box Jump', details: "Passo a Passo\n\nQuem já faz\n\n12'\n\nPara achar a maior altura" },
      { id: '3', title: "Emom 6'", details: '1 - 70 D.U.\n2 - 20 Kb OHS (24/16)' },
    ],
  },
  {
    date: '2026-10-28',
    title: 'METCON',
    sessions: [
      { id: '1', title: 'Warm-up', details: 'Mobilidade e Aquecimento Especificos' },
      { id: '2', title: 'Skill', details: 'Não Tem' },
      { id: '3', title: "For Time 30' - Duplas", details: '500 Flexões - 1 Atleta em Prancha\n\nEach Break\n\n20 Front Squats\n2 Rope Climbs\n50m Sprint Juntos' },
    ],
  },
  {
    date: '2026-10-29',
    title: 'LPO',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Perna Aberta No Solo\n30'' Mão em Cada Pé\n30'' Bom Dia\n30'' Cossack Cada Lado\n\n2 Rounds Of\n\n5 Deadlifts\n5 Hang Clean\n5 Front Squats\n5 Shoulder Press\n\nForça - Squat Snatch\n\n3x3 - 75%\n3x2 - 80%\n2x3 - 85%" },
      { id: '2', title: 'Hang Clean and Jerk', details: "Passo a Passo\n\nThen\n\nEmom 6'\n\n1 - 6 Hang Clean And Jerk (60/35)\n2 - 12 BOTB" },
      { id: '3', title: "Amrap 7'", details: '1-2-3-4-5-6-7-8...\nDeadlifts (100/70)\nHSPU' },
    ],
  },
  {
    date: '2026-10-30',
    title: 'GYM',
    sessions: [
      { id: '1', title: 'Warm-up', details: "Mobility + Warm Up\n\n30'' Pé na Parede\n30'' Puxando Pé Atrás\n30'' Runner Position\n30'' Agachado\n\n2 Rounds Of\n\n10 Step Ups\n10 V-Ups\n50m Run\n\nForça - Panturrilha\n\n12 Flexão Plantar Kb\n12 Agachamentos Com Salto" },
      { id: '2', title: 'Box Jump Over', details: "Passo a Passo\n\nQuem já faz\n\nAmrap 10'\n\n8 Box Jump Overs\n12 T2B\n50m Run" },
      { id: '3', title: "Emom 12'", details: '1 - 150m Sprint\n2 - 20 Wall Balls (20/16)\n3 - 20 Pull Ups' },
    ],
  },
  {
    date: '2026-10-31',
    title: 'FECHADO',
    sessions: [],
  },
];

export default OUTUBRO_2026;
