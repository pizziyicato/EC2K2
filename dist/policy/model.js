/**
 * EC2K2 teaching model. Values are illustrative, not estimates of an economy.
 * A closed economy with fixed expected inflation, a fixed capital stock and
 * horizontal short-run aggregate supply at the currently selected price.
 * IS: r = a - bY.
 * Money market: M/P = l0 + lY*Y - lr*r.
 * Goods market: C = c0 + 0.5Y - r; I = i0 - 4r; Y = C + I + G.
 * Interest rates are expressed in illustrative percentage points.
 */

export const BASE = Object.freeze({
  a: 14, b: 0.1, l0: 60, lY: 0.8, lr: 10,
  M: 100, Ystar: 100, c0: 15, i0: 35, G: 20, P: 1,
});

export const SCENARIOS = Object.freeze([
  {
    id: 'money', title: 'Money supply', shortLabel: 'Money supply', symbol: 'M',
    description: 'Change the nominal money stock. Prices initially stay fixed, so real balances and the LM curve change first.',
    initialShift: 'LM',
    directionLabels: { '1': 'Increase money supply', '-1': 'Decrease money supply' },
    source: 'Lecture 6, PDF pages 73–81; Lecture 8, PDF pages 35–37',
  },
  {
    id: 'fiscal', title: 'Government spending', shortLabel: 'Government spending', symbol: 'G',
    description: 'Change government purchases while holding full employment output fixed, as in the Keynesian fiscal example.',
    initialShift: 'IS',
    directionLabels: { '1': 'Increase spending', '-1': 'Decrease spending' },
    source: 'Lecture 8, PDF pages 33 and 38–40',
  },
  {
    id: 'confidence', title: 'Consumer confidence', shortLabel: 'Confidence', symbol: 'c₀',
    description: 'Change autonomous consumption. More spending at a given income and interest rate shifts IS right.',
    initialShift: 'IS',
    directionLabels: { '1': 'More confident', '-1': 'Less confident' },
    source: 'Lecture 6, PDF pages 22–27',
  },
  {
    id: 'money-demand', title: 'Money demand', shortLabel: 'Money demand', symbol: 'l₀',
    description: 'Change the demand to hold money at a given income and interest rate. Nominal money supply stays fixed.',
    initialShift: 'LM',
    directionLabels: { '1': 'Higher money demand', '-1': 'Lower money demand' },
    source: 'Lecture 6, PDF pages 38–40',
  },
  {
    id: 'productivity', title: 'Productive capacity', shortLabel: 'Productivity', symbol: 'Y*',
    description: 'Isolate the full employment output change from a supply shock. The slider changes Y* by half its displayed percentage. IS and LM do not move immediately while P is fixed.',
    initialShift: 'FE and LRAS',
    directionLabels: { '1': 'Higher capacity', '-1': 'Lower capacity' },
    source: 'Lecture 6, PDF pages 16 and 51–54',
  },
].map((scenario) => Object.freeze({
  ...scenario, label: scenario.shortLabel,
  directionLabels: Object.freeze(scenario.directionLabels),
})));

const bounded = (value, low, high, name) => {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${name} must be finite`);
  return Math.min(high, Math.max(low, number));
};

export function isRate(params, Y) {
  return params.a - params.b * Y;
}

export function lmRate(params, P, Y) {
  if (!(P > 0) || !Number.isFinite(P)) return NaN;
  return (params.l0 + params.lY * Y - params.M / P) / params.lr;
}

export function adPrice(params, Y) {
  const realBalances = params.l0 + params.lY * Y - params.lr * isRate(params, Y);
  return realBalances > 0 ? params.M / realBalances : NaN;
}

/** Solve the IS and LM intersection for a given positive price. */
export function equilibrium(params, P) {
  if (!(P > 0) || !Number.isFinite(P)) throw new RangeError('Price must be positive');
  const denominator = params.lY + params.lr * params.b;
  if (!(denominator > 0)) throw new RangeError('The equilibrium must have a positive denominator');
  const Y = (params.M / P - params.l0 + params.lr * params.a) / denominator;
  const r = isRate(params, Y);
  return {
    Y, r, P,
    C: params.c0 + 0.5 * Y - r,
    I: params.i0 - 4 * r,
    G: params.G, M: params.M, Ystar: params.Ystar,
    realBalances: params.M / P,
    outputGap: Y - params.Ystar,
  };
}

/**
 * progress=0 gives the immediate fixed-price equilibrium.
 * progress=1 gives general equilibrium at the shocked full employment output.
 * Intermediate values illustrate a monotone price adjustment path. They are
 * not a forecast of how long adjustment takes or an estimated dynamic law.
 */
export function solve(scenarioId = 'money', strength = 20, direction = 1, progress = 0) {
  const scenario = SCENARIOS.find((entry) => entry.id === scenarioId);
  if (!scenario) throw new RangeError(`Unknown scenario: ${scenarioId}`);
  const s = bounded(strength, 0, 30, 'Shock strength') / 100;
  const sign = Number(direction) < 0 ? -1 : 1;
  const t = bounded(progress, 0, 1, 'Adjustment progress');
  const initialParams = { ...BASE };
  const params = { ...BASE };

  switch (scenarioId) {
    case 'money': params.M *= 1 + sign * s; break;
    case 'fiscal': params.G *= 1 + sign * s; break;
    case 'confidence': params.c0 *= 1 + sign * s; break;
    case 'money-demand': params.l0 *= 1 + sign * s; break;
    case 'productivity': params.Ystar *= 1 + sign * s / 2; break;
  }
  params.a = (params.c0 + params.i0 + params.G) / 5;
  const initial = equilibrium(initialParams, BASE.P);
  const short = equilibrium(params, BASE.P);
  const longPrice = adPrice(params, params.Ystar);
  if (!(longPrice > 0) || !Number.isFinite(longPrice)) {
    throw new RangeError('This shock does not admit a positive-price full employment equilibrium');
  }
  const long = equilibrium(params, longPrice);
  const currentPrice = t === 0 ? BASE.P : t === 1 ? longPrice
    : Math.exp((1 - t) * Math.log(BASE.P) + t * Math.log(longPrice));
  const current = equilibrium(params, currentPrice);
  return {
    scenarioId, strength: s * 100, direction: sign, progress: t,
    initial, short, long, current, params, initialParams,
  };
}
