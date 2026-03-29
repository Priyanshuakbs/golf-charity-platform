/**
 * Draw Engine
 * Supports two draw modes as per PRD:
 *  1. RANDOM  — standard lottery-style, 5 numbers drawn randomly (1–45 Stableford range)
 *  2. WEIGHTED — drawn based on frequency of user scores (most/least common)
 *
 * Match tiers: 5-match (jackpot), 4-match, 3-match
 * Jackpot rolls over to next month if unclaimed.
 */

const Score = require('../models/Score');
const User = require('../models/User');

const SCORE_MIN = 1;
const SCORE_MAX = 45;
const DRAW_COUNT = 5; // 5 numbers drawn per round

/**
 * Generate 5 unique random numbers between SCORE_MIN and SCORE_MAX
 */
const randomDraw = () => {
  const numbers = new Set();
  while (numbers.size < DRAW_COUNT) {
    numbers.add(Math.floor(Math.random() * (SCORE_MAX - SCORE_MIN + 1)) + SCORE_MIN);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * Build a frequency map of all user scores across the platform
 * @returns {Map<number, number>} score -> frequency
 */
const buildScoreFrequencyMap = async () => {
  const scores = await Score.find({}).select('scores');
  const freq = new Map();

  scores.forEach((doc) => {
    doc.scores.forEach(({ value }) => {
      freq.set(value, (freq.get(value) || 0) + 1);
    });
  });

  return freq;
};

/**
 * Weighted draw — biased toward MOST frequent scores
 * Scores that appear more often have higher chance of being drawn
 */
const weightedDrawByMostFrequent = async () => {
  const freq = await buildScoreFrequencyMap();
  return weightedSelect(freq, 'most');
};

/**
 * Weighted draw — biased toward LEAST frequent scores
 */
const weightedDrawByLeastFrequent = async () => {
  const freq = await buildScoreFrequencyMap();
  return weightedSelect(freq, 'least');
};

/**
 * Weighted selection helper
 * @param {Map} freqMap
 * @param {'most'|'least'} bias
 */
const weightedSelect = (freqMap, bias) => {
  // Fill any missing values in 1–45 range with weight 1
  const pool = [];
  for (let i = SCORE_MIN; i <= SCORE_MAX; i++) {
    const freq = freqMap.get(i) || 1;
    const weight = bias === 'most' ? freq : Math.max(1, 100 - freq);
    for (let w = 0; w < weight; w++) {
      pool.push(i);
    }
  }

  const selected = new Set();
  let attempts = 0;
  while (selected.size < DRAW_COUNT && attempts < 10000) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.add(pool[idx]);
    attempts++;
  }

  // Fallback to random if weighted pool is too small
  while (selected.size < DRAW_COUNT) {
    selected.add(Math.floor(Math.random() * (SCORE_MAX - SCORE_MIN + 1)) + SCORE_MIN);
  }

  return Array.from(selected).sort((a, b) => a - b);
};

/**
 * Run the draw with specified mode
 * @param {'random'|'weighted_most'|'weighted_least'} mode
 * @returns {number[]} 5 drawn numbers
 */
const runDraw = async (mode = 'random') => {
  switch (mode) {
    case 'weighted_most':
      return await weightedDrawByMostFrequent();
    case 'weighted_least':
      return await weightedDrawByLeastFrequent();
    default:
      return randomDraw();
  }
};

/**
 * Match user scores against drawn numbers
 * Returns match count (0–5)
 * @param {number[]} userScores - array of user's last 5 scores (values only)
 * @param {number[]} drawnNumbers
 */
const countMatches = (userScores, drawnNumbers) => {
  const drawnSet = new Set(drawnNumbers);
  return userScores.filter((s) => drawnSet.has(s)).length;
};

/**
 * Determine match tier from match count
 * @param {number} matchCount
 * @returns {'five'|'four'|'three'|null}
 */
const getMatchTier = (matchCount) => {
  if (matchCount === 5) return 'five';
  if (matchCount === 4) return 'four';
  if (matchCount === 3) return 'three';
  return null;
};

/**
 * Find all winners for a given draw result
 * Queries all active subscribers and compares their scores
 * @param {number[]} drawnNumbers
 * @returns {object} { fiveMatch: [], fourMatch: [], threeMatch: [] }
 */
const findWinners = async (drawnNumbers) => {
  const winners = { fiveMatch: [], fourMatch: [], threeMatch: [] };

  // Get all active subscribers with their scores
  const activeUsers = await User.find({
    isSubscribed: true,
    subscriptionEnd: { $gt: new Date() },
    role: 'user',
  }).select('_id name email');

  const scores = await Score.find({
    userId: { $in: activeUsers.map((u) => u._id) },
  }).populate('userId', 'name email');

  scores.forEach((scoreDoc) => {
    if (!scoreDoc.scores || scoreDoc.scores.length < 5) return;

    const userScoreValues = scoreDoc.scores
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((s) => s.value);

    const matchCount = countMatches(userScoreValues, drawnNumbers);
    const tier = getMatchTier(matchCount);

    if (tier) {
      const key = `${tier}Match`;
      winners[key].push({
        userId: scoreDoc.userId._id,
        name: scoreDoc.userId.name,
        email: scoreDoc.userId.email,
        matchCount,
        matchedScores: userScoreValues.filter((s) => drawnNumbers.includes(s)),
        userScores: userScoreValues,
      });
    }
  });

  return winners;
};

/**
 * Simulate a draw without saving — used for admin preview
 * @param {'random'|'weighted_most'|'weighted_least'} mode
 */
const simulateDraw = async (mode = 'random') => {
  const drawnNumbers = await runDraw(mode);
  const winners = await findWinners(drawnNumbers);

  return {
    drawnNumbers,
    winners,
    summary: {
      fiveMatchCount: winners.fiveMatch.length,
      fourMatchCount: winners.fourMatch.length,
      threeMatchCount: winners.threeMatch.length,
      jackpotWon: winners.fiveMatch.length > 0,
    },
    mode,
    simulatedAt: new Date(),
  };
};

module.exports = {
  runDraw,
  simulateDraw,
  findWinners,
  countMatches,
  getMatchTier,
  randomDraw,
  DRAW_COUNT,
  SCORE_MIN,
  SCORE_MAX,
};