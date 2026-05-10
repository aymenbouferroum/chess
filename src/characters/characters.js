const CHARACTERS = [
  {
    id: 'pawnie',
    name: 'Pawnie',
    title: 'The Village Rookie',
    level: 1,
    dialogue: {
      before: "H-hi there! I'm Pawnie, and this is my very first real battle! The elder pawns told me to always move forward, never look back. I hope I don't mess this up too badly... Please be gentle with me!",
      after: "Wow... you really are strong! I gave it my best shot, but I still have so much to learn. Maybe one day I'll make it to the other side and become a queen too! Thanks for the lesson!",
      win: "I-I won?! I actually won! Wait until the other pawns hear about this! The littlest piece on the board just beat a real challenger! This is the happiest day of my life!",
    },
    gameDialogue: {
      gameStart: [
        "O-okay, here we go! Don't be too mean...",
        "I'll try my best! Promise!",
        "The elder pawns believe in me... I think..."
      ],
      bossCapture: [
        "I... I got one! Did you see that?!",
        "W-was that okay? I didn't mean to be rude!",
        "Oh! I actually captured something!"
      ],
      playerCapture: [
        "Ouch! That was my friend!",
        "N-no! I wasn't ready for that...",
        "Please be gentle..."
      ],
      bossCheck: [
        "Is that... check? Did I do a check?!",
        "W-wait, your king is in danger! Sorry!"
      ],
      playerCheck: [
        "Eek! My king! Help!",
        "Oh no oh no oh no...",
        "The elder pawns didn't prepare me for this!"
      ],
      bossTaunt: [
        "I'm thinking really hard...",
        "The elder pawns said patience is key...",
        "Um... give me a moment..."
      ],
      milestone: [
        "We've been playing a while, huh?",
        "I haven't lost yet... right?",
        "This is the longest game I've ever played!"
      ],
      lowHealth: [
        "I'm running out of friends here...",
        "This isn't going well for me...",
        "M-maybe I should have stayed home today..."
      ],
      playerLowHealth: [
        "Am... am I actually winning?!",
        "The board is looking good for me!",
        "Wait until the other pawns hear about this!"
      ],
    },
    personality: 'nervous',
    theme: 'space',
    colors: { primary: '#88ccff', secondary: '#4488cc', skin: '#ffcc99', eye: '#ffffff', pupil: '#224466' },
  },
  {
    id: 'bishbosh',
    name: 'Bish-Bosh',
    title: 'The Diagonal Dreamer',
    level: 2,
    dialogue: {
      before: "Heh heh heh... welcome to my domain of diagonals! You think you can handle the slash and the slash-back? I have been training on the light squares my entire life. Prepare yourself!",
      after: "Impressive... you navigated my diagonals better than I expected. Most challengers get lost in the cross-pattern. You have a sharp eye. Perhaps the straight paths are not so boring after all.",
      win: "Ha! Did you see that fork? That pin? My bishop pair controlled the whole board! The diagonal is the true path to victory, my friend. Come back when you understand the power of the slash!",
    },
    gameDialogue: {
      gameStart: [
        "Let's see those diagonals fly!",
        "Ready for the slash and the slash-back?",
        "The diagonal is calling!"
      ],
      bossCapture: [
        "Heh heh! Right through the diagonal!",
        "Did you see that angle? Beautiful!",
        "The slash strikes again!"
      ],
      playerCapture: [
        "Hey! That was my favorite diagonal piece!",
        "You dare cross MY diagonal?",
        "Okay okay, lucky shot..."
      ],
      bossCheck: [
        "Check! The diagonal delivers!",
        "Your king can't escape the slash!"
      ],
      playerCheck: [
        "Whoa! My king needs a diagonal escape!",
        "That's not supposed to happen!"
      ],
      bossTaunt: [
        "I see angles you can't even imagine...",
        "The diagonals whisper to me...",
        "Calculating the perfect slash..."
      ],
      milestone: [
        "The diagonals are heating up!",
        "This game is getting interesting!",
        "You're better than I expected!"
      ],
      lowHealth: [
        "My diagonal army is thinning out...",
        "The cross-pattern is breaking...",
        "I need to rethink my angles..."
      ],
      playerLowHealth: [
        "The diagonal dominates!",
        "See? Straight lines are overrated!",
        "My bishop pair is unstoppable!"
      ],
    },
    personality: 'enthusiastic',
    theme: 'egypt',
    colors: { primary: '#ff9966', secondary: '#cc6633', skin: '#ffcc99', eye: '#ffffff', pupil: '#663322' },
  },
  {
    id: 'rokee',
    name: 'Rook-E',
    title: 'The Iron Tower',
    level: 3,
    dialogue: {
      before: "Straight lines. No shortcuts. No fancy diagonal tricks. That is how we do things on the rank and file. I have stood guard on this corner for a thousand games. Show me if you have the discipline to break through.",
      after: "Solid play. You respected the fundamentals and outmaneuvered my fortress. A tower can be toppled by patience and precision. You have both. I salute your technique.",
      win: "As I said: straight lines win games. You tried to dance around the board, but you cannot outrun the iron tower. When the seventh rank opens, it is already too late. Better luck next time.",
    },
    gameDialogue: {
      gameStart: [
        "Straight lines. Let us begin.",
        "The rank and file await.",
        "Discipline wins battles."
      ],
      bossCapture: [
        "Removed. Efficiently.",
        "The tower claims another.",
        "Straight through. No deviation."
      ],
      playerCapture: [
        "A minor breach. The wall holds.",
        "You took one stone. The fortress remains.",
        "Acceptable losses."
      ],
      bossCheck: [
        "Your king stands exposed on the file.",
        "Check. The tower sees all straight lines."
      ],
      playerCheck: [
        "The wall bends but does not break.",
        "A direct assault. Noted."
      ],
      bossTaunt: [
        "Patience. The tower considers all lines.",
        "I do not rush. I endure.",
        "Every rank. Every file. Calculated."
      ],
      milestone: [
        "You have discipline. I respect that.",
        "The siege continues.",
        "Neither of us yields."
      ],
      lowHealth: [
        "The fortress is crumbling...",
        "My defenses grow thin.",
        "Even iron towers can fall..."
      ],
      playerLowHealth: [
        "The wall advances. You retreat.",
        "Discipline always wins.",
        "Your army scatters before the tower."
      ],
    },
    personality: 'stoic',
    theme: 'medieval',
    colors: { primary: '#aabbcc', secondary: '#667788', skin: '#ddbb99', eye: '#ffffff', pupil: '#334455' },
  },
  {
    id: 'knightsade',
    name: 'KnightShade',
    title: 'The Shadow Lancer',
    level: 4,
    dialogue: {
      before: "*silence* ... You cannot see me coming. No piece on this board moves like I do. I leap over walls, strike from behind, and vanish before you know what happened. Do not bother predicting me.",
      after: "*low whistle* ... You actually saw through my shadows. That knight fork you avoided in the middlegame? Nobody avoids that. You are not like the others. I respect that. Until we meet again.",
      win: "*chuckle* ... Did you feel that? The moment your queen was forked and your king was exposed? That is the sound of the shadows claiming another victim. The Lancer always strikes true.",
    },
    gameDialogue: {
      gameStart: [
        "*silence* ... The shadows are watching.",
        "You will not see me coming.",
        "*whisper* ... Let the game begin."
      ],
      bossCapture: [
        "*vanishes* ... One less piece for you.",
        "The shadow strikes and disappears.",
        "You never saw it coming."
      ],
      playerCapture: [
        "*hiss* ... A shadow was caught in the light.",
        "Clever. But shadows regenerate.",
        "You found one. There are more."
      ],
      bossCheck: [
        "Your king hides from shadows in vain.",
        "*chuckle* ... Check from the darkness."
      ],
      playerCheck: [
        "*startled* ... The light reaches my king.",
        "An unexpected move. Interesting."
      ],
      bossTaunt: [
        "The shadows are deliberating...",
        "*silence* ...",
        "I see paths you cannot imagine."
      ],
      milestone: [
        "You last longer than most. Interesting.",
        "The shadows grow restless.",
        "Few survive this deep into my domain."
      ],
      lowHealth: [
        "The shadows thin... but never vanish.",
        "You push the darkness back...",
        "*grudging respect* ... Well played."
      ],
      playerLowHealth: [
        "The shadows consume your army.",
        "Darkness swallows all eventually.",
        "Your pieces fall like whispers."
      ],
    },
    personality: 'mysterious',
    theme: 'cyberpunk',
    colors: { primary: '#6644aa', secondary: '#442288', skin: '#ccbbdd', eye: '#ffcc00', pupil: '#221144' },
  },
  {
    id: 'queenie',
    name: 'Queenie',
    title: 'The Royal Tyrant',
    level: 5,
    dialogue: {
      before: "Oh my, another challenger? How adorable. Do you know who I am? I am the most powerful piece on this board, darling. I move in every direction, any distance. Bow before your queen!",
      after: "Not bad! Not bad at all! You actually managed to outplay me! I have not been defeated in fifty games. You have earned a curtsy from the queen herself. Consider this an honor!",
      win: "Did you really think you could defeat the queen? I am the sun around which this board revolves. Every piece bows to my movement. Off with your king! That is how the monarchy works, darling.",
    },
    gameDialogue: {
      gameStart: [
        "The queen graces you with her presence!",
        "Bow, darling. The game begins.",
        "This will be over quickly, sweetie."
      ],
      bossCapture: [
        "Another subject removed from the board!",
        "The queen takes what she wants, darling!",
        "Off with their head!"
      ],
      playerCapture: [
        "How DARE you touch my pieces!",
        "That was one of my favorites!",
        "You will pay for that insolence!"
      ],
      bossCheck: [
        "Your king kneels before the queen!",
        "Check! Bow before royalty!"
      ],
      playerCheck: [
        "You threaten MY king? The audacity!",
        "This is treason, darling!"
      ],
      bossTaunt: [
        "A queen considers all her options...",
        "Do not rush royalty.",
        "Every direction. Any distance. My choice."
      ],
      milestone: [
        "Still here? How persistent of you.",
        "You amuse the queen. Continue.",
        "I expected this to be over by now!"
      ],
      lowHealth: [
        "My court is diminishing!",
        "This is NOT how a queen should be treated!",
        "Where are my loyal subjects?!"
      ],
      playerLowHealth: [
        "The monarchy prevails!",
        "Your army bows to the queen!",
        "This is the natural order, darling."
      ],
    },
    personality: 'dramatic',
    theme: 'japanese',
    colors: { primary: '#ff66aa', secondary: '#cc4488', skin: '#ffddcc', eye: '#ffffff', pupil: '#661144' },
  },
  {
    id: 'castle',
    name: 'CastlE',
    title: 'The Unbreakable Fortress',
    level: 6,
    dialogue: {
      before: "I am the wall. I am the shield. I am the fortress that has never fallen. You can throw your strongest pieces at me, but they will break against my defenses. Patience is my weapon. Come, test the wall.",
      after: "The wall has fallen. You breached my defenses with a patience that matched my own. I have not seen such methodical dismantling in centuries. You are a true siege master. Well fought.",
      win: "The fortress stands. Your attacks were predictable, your sacrifices wasteful. A true defender knows that the best offense is a perfect defense. My pawns are your tombstones. Impenetrable!",
    },
    gameDialogue: {
      gameStart: [
        "The wall stands ready. Come.",
        "You may begin your siege.",
        "I have all the time in the world."
      ],
      bossCapture: [
        "The fortress claims a prisoner.",
        "One more piece absorbed into the wall.",
        "My defense is my offense."
      ],
      playerCapture: [
        "A brick falls. The wall remains.",
        "You chip away. But slowly.",
        "Every fortress loses a stone or two."
      ],
      bossCheck: [
        "The fortress presses forward. Check.",
        "Even walls can attack."
      ],
      playerCheck: [
        "A crack in the wall. I will repair it.",
        "You found a weakness. Temporarily."
      ],
      bossTaunt: [
        "I can wait forever.",
        "The wall does not hurry.",
        "Patience outlasts aggression."
      ],
      milestone: [
        "The siege drags on. I am comfortable.",
        "You cannot outlast the fortress.",
        "Time is my ally."
      ],
      lowHealth: [
        "The wall is breached in places...",
        "My fortress shows cracks...",
        "I must shore up the defenses..."
      ],
      playerLowHealth: [
        "Your siege has failed.",
        "The fortress stands. Your army does not.",
        "Impenetrable. As always."
      ],
    },
    personality: 'patient',
    theme: 'steampunk',
    colors: { primary: '#88aa88', secondary: '#557755', skin: '#ccbb99', eye: '#ffffff', pupil: '#224422' },
  },
  {
    id: 'endgamer',
    name: 'EndGamer',
    title: 'The Patient Scholar',
    level: 7,
    dialogue: {
      before: "The opening is merely a handshake. The middlegame is just conversation. The TRUE battle happens in the endgame, when only a handful of pieces remain. I have studied every endgame position known to chess. I will see you there.",
      after: "You outplayed me in the endgame. That is not supposed to happen. I have memorized Lucena, Philidor, and the Vancura. Yet you found a path I did not see. You are a scholar as well as a warrior.",
      win: "As I predicted. You played aggressively in the opening, burned your advantages in the middlegame, and arrived at the endgame with nothing. The endgame is where preparation meets opportunity. I had both.",
    },
    gameDialogue: {
      gameStart: [
        "The opening means nothing. Let us proceed.",
        "I am waiting for the endgame.",
        "Play your opening. I will play the ending."
      ],
      bossCapture: [
        "One less piece for the endgame. Good.",
        "Simplification favors the prepared.",
        "Fewer pieces. Closer to my domain."
      ],
      playerCapture: [
        "Material is temporary. Knowledge is permanent.",
        "Take my pieces. The endgame still favors me.",
        "You trade pieces. I trade for position."
      ],
      bossCheck: [
        "Check. The endgame approaches.",
        "Your king wanders into familiar territory."
      ],
      playerCheck: [
        "A check. But the endgame has not begun.",
        "Premature aggression. I can wait."
      ],
      bossTaunt: [
        "Studying the position. Every detail matters.",
        "Lucena, Philidor... which one applies here?",
        "The endgame tables tell me everything."
      ],
      milestone: [
        "We approach the middlegame. Almost there.",
        "Soon the pieces will simplify.",
        "The real game is about to begin."
      ],
      lowHealth: [
        "Fewer pieces... but this is my strength.",
        "The endgame is here. Finally.",
        "With less on the board, I see more clearly."
      ],
      playerLowHealth: [
        "The position simplifies in my favor.",
        "Your army shrinks. My knowledge grows.",
        "The endgame belongs to the scholar."
      ],
    },
    personality: 'calm',
    theme: 'ocean',
    colors: { primary: '#5599cc', secondary: '#3377aa', skin: '#ccddcc', eye: '#ffffff', pupil: '#113355' },
  },
  {
    id: 'forkmaster',
    name: 'ForkMaster',
    title: 'The Tactician',
    level: 8,
    dialogue: {
      before: "Can you spot the fork? I can. I see three of them right now, and we have not even started. Tactics flow like water through my mind. Every piece you place is a target. Every move you make is a mistake waiting to happen.",
      after: "You avoided my forks. You sidestepped my pins. You escaped my skewers. That is rare. Most opponents are tactical roadkill by move fifteen. You must have trained specifically for me. I am impressed.",
      win: "Forked again! Your queen and rook were lined up like dominoes. Did you not see it coming? Tactics, my friend. Tactics win games. You can have all the strategy in the world, but one fork ends it all.",
    },
    gameDialogue: {
      gameStart: [
        "I already see three forks. Do you?",
        "Every piece you place is a target.",
        "Tactics. Pure tactics. Let's go."
      ],
      bossCapture: [
        "Forked! Classic.",
        "Did you see that pin? Of course not.",
        "Tactical superiority. As expected."
      ],
      playerCapture: [
        "Hmm. You spotted that one.",
        "Lucky. That won't happen again.",
        "One piece. I'll take three of yours."
      ],
      bossCheck: [
        "Check! With a fork attached, naturally.",
        "Your king AND your rook. Pick one."
      ],
      playerCheck: [
        "A check? That's not a tactic, that's desperation.",
        "Checking without purpose. Amateur."
      ],
      bossTaunt: [
        "Calculating... so many forks, so little time.",
        "The pins and skewers are lining up perfectly.",
        "I see a tactic in every position."
      ],
      milestone: [
        "Surviving this long? Impressive. Slightly.",
        "Most opponents are done by now.",
        "You must have trained specifically for me."
      ],
      lowHealth: [
        "Fewer pieces means fewer forks... wait.",
        "You're dismantling my tactical playground!",
        "I need more pieces to fork!"
      ],
      playerLowHealth: [
        "Fork after fork after fork!",
        "Your army is my tactical buffet.",
        "See? Tactics always win."
      ],
    },
    personality: 'smug',
    theme: 'wildwest',
    colors: { primary: '#dd8844', secondary: '#bb6622', skin: '#ffcc99', eye: '#ffffff', pupil: '#553311' },
  },
  {
    id: 'checkmate',
    name: 'Checkmate',
    title: 'The Executioner',
    level: 9,
    dialogue: {
      before: "Every move brings you closer to your end. I do not play chess. I orchestrate checkmates. Your king is already marked. The only question is how many moves until the final blow. Let us begin the countdown.",
      after: "You... you dodged my traps. You survived the mating net. You found resources where there should have been none. I have executed a thousand kings, but you... you are different. The Executioner bows to you.",
      win: "Check. And mate. As foreseen. Your king is surrounded, your army scattered, your hopes crushed. There was never any doubt. The Executioner does not miss. Your soul belongs to the board now.",
    },
    gameDialogue: {
      gameStart: [
        "The countdown begins now.",
        "Every move brings the end closer.",
        "Your king is already marked."
      ],
      bossCapture: [
        "One less defender for your king.",
        "The net tightens.",
        "Another piece falls. The end approaches."
      ],
      playerCapture: [
        "You delay the inevitable.",
        "A sacrifice? How touching. And futile.",
        "Take my pieces. The checkmate still comes."
      ],
      bossCheck: [
        "Check. The execution draws near.",
        "Your king runs. But there is nowhere to hide."
      ],
      playerCheck: [
        "A temporary reprieve. Nothing more.",
        "You threaten my king? Bold. And foolish."
      ],
      bossTaunt: [
        "I am orchestrating your demise...",
        "The mating net is taking shape...",
        "Can you feel it? The walls closing in?"
      ],
      milestone: [
        "You survive. For now.",
        "The execution has been delayed. Not cancelled.",
        "Most fall before this point."
      ],
      lowHealth: [
        "You dismantle my army... but not my purpose.",
        "The executioner needs only one piece.",
        "Fewer pieces. But the checkmate remains."
      ],
      playerLowHealth: [
        "Your king stands alone. As foreseen.",
        "The execution proceeds on schedule.",
        "There is no escape from the executioner."
      ],
    },
    personality: 'ominous',
    theme: 'crystal',
    colors: { primary: '#882222', secondary: '#551111', skin: '#ddbbbb', eye: '#ff4444', pupil: '#220000' },
  },
  {
    id: 'grandmasterx',
    name: 'Grandmaster X',
    title: 'The Absolute',
    level: 10,
    dialogue: {
      before: "You have climbed the mountain. You have defeated nine challengers. But reaching the summit and conquering it are different things entirely. I am not merely a chess player. I am chess itself. Make your first move. It will also be your last.",
      after: "Impossible... IMPOSSIBLE! I have not lost a game in thirty years. I have faced grandmasters, computers, and champions. Yet you... you found the truth within the lies. Chess 2.0 is yours. The throne is empty. Take it.",
      win: "You were strong. Stronger than the others. But strength without perfection is merely potential. And potential, my friend, is wasted on the dead. I am the Absolute. I was before chess, and I will be after. Rest now.",
    },
    gameDialogue: {
      gameStart: [
        "Make your first move. It will define you.",
        "The summit awaits. Begin.",
        "I am chess itself. Show me what you are."
      ],
      bossCapture: [
        "Perfection requires sacrifice. Yours.",
        "Removed. As calculated thirty moves ago.",
        "The Absolute does not err."
      ],
      playerCapture: [
        "Interesting. You found a real move.",
        "That changes nothing in the grand position.",
        "A strong choice. I have seen stronger."
      ],
      bossCheck: [
        "Check. The truth is inescapable.",
        "Your king faces the Absolute."
      ],
      playerCheck: [
        "A check. I expected it four moves ago.",
        "Bold. But calculated. By both of us."
      ],
      bossTaunt: [
        "I am considering every possibility.",
        "The position reveals its secrets to me.",
        "Perfection takes time."
      ],
      milestone: [
        "You have earned your place at this board.",
        "Few reach this point against me.",
        "The game deepens. As does my respect."
      ],
      lowHealth: [
        "You challenge the Absolute... and you succeed?",
        "This has not happened in thirty years.",
        "Perhaps... you ARE chess."
      ],
      playerLowHealth: [
        "The summit is mine. As always.",
        "Potential without perfection is wasted.",
        "The Absolute remains absolute."
      ],
    },
    personality: 'serious',
    theme: 'artdeco',
    colors: { primary: '#ffcc00', secondary: '#cc9900', skin: '#ffdd99', eye: '#ff6600', pupil: '#332200' },
  },
];
