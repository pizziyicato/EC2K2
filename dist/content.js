export const QUIZ = [
  {
    question: "Money supply rises while prices are fixed. What happens first?",
    options: ["Output rises and the real interest rate falls", "Output falls and the real interest rate rises", "Output and the real interest rate both rise", "Only the price level changes"],
    answer: 0,
    explanation: "More real money balances shift LM down. Lower interest rates encourage consumption and investment, raising output at the original price level.",
    source: "Lecture 6 · PDF pp. 73–81"
  },
  {
    question: "After a permanent 10% increase in money supply, what is the long-run result in the baseline model?",
    options: ["Output is permanently 10% higher", "The real interest rate stays lower", "The price level is 10% higher and real variables return to their initial values", "Government spending rises by 10%"],
    answer: 2,
    explanation: "With productive capacity and the other determinants unchanged, prices rise proportionately with money. Real balances return to their original level, restoring the original output and real interest rate.",
    source: "Lecture 6 · PDF pp. 76–81"
  },
  {
    question: "Government purchases rise in the fixed-price short run. Which combination does the baseline model predict?",
    options: ["Output falls and the real interest rate rises", "Output rises and the real interest rate falls", "Output is unchanged and prices rise immediately", "Output and the real interest rate both rise"],
    answer: 3,
    explanation: "Higher government purchases shift IS right. The new intersection lies higher along LM, so both output and the real interest rate increase.",
    source: "Lecture 8 · PDF pp. 38–40"
  },
  {
    question: "If FE stays fixed after government purchases rise, what must happen to total private spending in the long run?",
    options: ["Consumption plus investment rises", "Consumption plus investment falls", "Investment alone must fall by exactly the increase in government purchases", "Consumption plus investment stays unchanged"],
    answer: 1,
    explanation: "At unchanged full employment output, Y = C + I + G requires the increase in G to be offset by a fall in C + I. The higher real interest rate helps bring about this crowding out.",
    source: "Lecture 8 · PDF pp. 38–40"
  },
  {
    question: "The price level rises while nominal money supply and other demand determinants stay unchanged. What happens in the AD diagram?",
    options: ["AD shifts right", "AD shifts left", "The economy moves upward and leftward along the existing AD curve", "LRAS shifts right"],
    answer: 2,
    explanation: "A higher price level reduces M/P, shifts LM up and reduces the IS-LM equilibrium output. These different price-output combinations trace the same AD curve.",
    source: "Lecture 6 · PDF pp. 56–62"
  },
  {
    question: "What do the FE line and LRAS have in common?",
    options: ["Both show the same full employment output", "Both slope downward", "Both shift whenever the price level changes", "Both are determined only by money supply"],
    answer: 0,
    explanation: "FE and LRAS place the same Y* in two different diagrams. A change in productive capacity or labour market equilibrium moves both in the same direction.",
    source: "Lecture 6 · PDF pp. 13–16 and 63–65"
  },
  {
    question: "Why is SRAS horizontal in the basic Keynesian setup but upward sloping in the New Classical misperceptions model?",
    options: ["The horizontal axis changes between the two models", "The Keynesian setup assumes prices are fixed, while misperceptions make supply respond to unexpected prices", "The New Classical model assumes money demand is zero", "Both curves describe exactly the same assumptions"],
    answer: 1,
    explanation: "With fixed prices, firms meet demand at the prevailing price level. With misperceptions, producers may mistake unexpectedly high aggregate prices for better relative prices and increase output.",
    source: "Lecture 6 · PDF p. 63; Lecture 7 · PDF pp. 24–30"
  },
  {
    question: "In the New Classical misperceptions model, what does a fully anticipated monetary expansion do to output?",
    options: ["It raises output permanently", "It raises output only because expectations stay unchanged", "It lowers full employment output", "It leaves output at full employment because expected prices adjust"],
    answer: 3,
    explanation: "An anticipated expansion raises expected prices together with actual prices. AD and SRAS adjust, leaving no price surprise to push output away from Y*.",
    source: "Lecture 7 · PDF pp. 31–33"
  },
  {
    question: "An adverse productivity shock lowers full employment output. With demand determinants unchanged, what happens after prices adjust?",
    options: ["Output falls and the price level rises", "Output rises and the price level falls", "Output and the price level both fall", "Money supply automatically increases"],
    answer: 0,
    explanation: "FE and LRAS move left. With AD unchanged, the new long-run intersection has lower output and a higher price level. The price rise shifts LM up toward the new FE line.",
    source: "Lecture 6 · PDF pp. 51–54 and 63–67"
  },
  {
    question: "People want to hold more money at every income and interest rate. Money supply is unchanged. What is the immediate effect with fixed prices?",
    options: ["LM shifts down and AD shifts right", "IS and FE both shift right", "LM shifts up and AD shifts left", "Only LRAS shifts"],
    answer: 2,
    explanation: "Higher autonomous money demand raises the interest rate needed to clear the asset market. LM shifts up, reducing spending and equilibrium output at each price level.",
    source: "Lecture 6 · PDF pp. 38–40 and 56–62"
  }
];

export const CURVES = [
  {
    id: "is",
    name: "IS",
    market: "Goods market",
    definition: "Every combination of output and the real interest rate where desired saving equals desired investment.",
    why: "Higher income increases saving. A lower interest rate encourages investment and discourages saving until they match again.",
    slope: "Downward sloping in the r–Y diagram",
    shifters: "More government purchases, stronger desired consumption or stronger desired investment shift IS right. Reversing these changes shifts it left.",
    trap: "An interest-rate change moves you along a given IS curve. A tax cut shifts IS only when it changes desired consumption or investment."
  },
  {
    id: "lm",
    name: "LM",
    market: "Asset market",
    definition: "Every combination of output and the real interest rate where real money demand equals real money supply.",
    why: "Higher output generates more transactions. With real money supply fixed, a higher interest rate reduces the willingness to hold money enough to restore equilibrium.",
    slope: "Upward sloping in the baseline r–Y diagram",
    shifters: "More nominal money or a lower price level shifts LM down. More autonomous money demand or a higher price level shifts it up.",
    trap: "Money demand depends on the nominal rate. The real-rate diagram holds expected inflation fixed."
  },
  {
    id: "fe",
    name: "FE",
    market: "Labour market",
    definition: "The full employment output associated with equilibrium employment, productivity and the capital stock.",
    why: "The baseline labour market pins down equilibrium employment. The production function then gives Y* independently of the interest rate shown on the vertical axis.",
    slope: "Vertical at Y* in the r–Y diagram",
    shifters: "Higher productivity, more capital or an increase in equilibrium employment can shift FE right.",
    trap: "Output can temporarily exceed Y*. Full employment can still include natural unemployment."
  },
  {
    id: "ad",
    name: "AD",
    market: "Goods and asset markets together",
    definition: "The output generated by the IS-LM intersection at each possible price level.",
    why: "A higher price level reduces real money balances, shifts LM up, raises the real interest rate and reduces spending and output.",
    slope: "Downward sloping in the P–Y diagram",
    shifters: "Anything that raises the IS-LM equilibrium output at a given price level shifts AD right. More government purchases and more money are two examples.",
    trap: "A change in P moves you along AD. A change in M can shift AD."
  },
  {
    id: "sras",
    name: "SRAS",
    market: "Short-run aggregate supply",
    definition: "The relationship between output supplied and the price level under the chosen short-run assumptions.",
    why: "In this simulator, prices are fixed at each short-run stage and firms meet demand. During adjustment, the prevailing price level changes and the horizontal SRAS moves.",
    slope: "Horizontal under fixed prices",
    shifters: "A higher prevailing price level moves horizontal SRAS up. A lower prevailing price level moves it down.",
    trap: "The New Classical misperceptions model has an upward-sloping SRAS. Keep that information assumption separate from price stickiness."
  },
  {
    id: "lras",
    name: "LRAS",
    market: "Long-run aggregate supply",
    definition: "The economy's full employment output after prices have adjusted.",
    why: "Productivity, capital and equilibrium employment determine full employment output. Changing the overall price level alone leaves that output unchanged.",
    slope: "Vertical at Y* in the P–Y diagram",
    shifters: "The same changes that shift FE shift LRAS in the same direction.",
    trap: "Returning to full employment after a supply shock means returning to the new Y*, which can differ from the initial output."
  }
];

export const SOURCES = [
  {
    title: "Lecture 6 · The IS-LM-FE Model",
    pages: "PDF pp. 13–40, 42–44, 51–81",
    coverage: "Curve derivations and shifts, simultaneous equilibrium, AD derivation, horizontal SRAS, supply shocks, price adjustment and monetary neutrality."
  },
  {
    title: "Lecture 7 · The New Classical and RBC Models",
    pages: "PDF pp. 16–19 and 24–33",
    coverage: "The Classical labour-supply response to government purchases, price misperceptions and anticipated versus unexpected monetary expansion."
  },
  {
    title: "Lecture 8 · The New Keynesian Model",
    pages: "PDF pp. 28–40 and 43–46",
    coverage: "Price stickiness, fixed-FE Keynesian monetary and fiscal examples, and the oil-shock qualification."
  }
];

export const MODEL_NOTES = [
  {
    title: "A fixed-price starting point",
    text: "The immediate short run holds the price level fixed and lets firms meet demand. The ordinary IS and LM slopes apply. Expected inflation stays fixed throughout each simulation."
  },
  {
    title: "One equilibrium, two diagrams",
    text: "Both charts use the same equations and the same output at every stage. AD is derived from IS and LM. FE and LRAS mark the same full employment output."
  },
  {
    title: "Supply shocks are isolated here",
    text: "The productivity scenario changes FE and LRAS while holding the initial price level fixed, following the isolated supply mechanism in Lecture 6. A New Keynesian oil shock can also raise firms' prices immediately and shift SRAS at impact."
  },
  {
    title: "Fiscal results depend on FE",
    text: "The simulator holds FE fixed when government purchases change, as in the Lecture 8 Keynesian example. In Lecture 7, government purchases can increase labour supply and shift FE right, so full employment output can change."
  },
  {
    title: "Illustrative teaching units",
    text: "Output starts at 100 and the price index at 1. The coefficients and shock sizes illustrate the model's mechanisms. They are a teaching calibration rather than estimates of actual policy effects."
  },
  {
    title: "Adjustment has no calendar",
    text: "The progress control traces a schematic adjustment in prices between the short-run and long-run equilibria. Its position does not represent months, years or an estimated adjustment speed."
  },
  {
    title: "A change in level",
    text: "The money scenario changes the level of the money stock once and holds the new level during adjustment. The proportional long-run price change concerns the price level. It does not imply permanently higher inflation."
  },
  {
    title: "The shock remains in place",
    text: "The long-run endpoint shows prices fully adjusted while the selected shock is still in place. Reversing the shock later would begin another adjustment."
  }
];
