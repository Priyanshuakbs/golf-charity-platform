/**
 * Prize Pool Utility
 * Calculates prize distribution based on active subscriber count
 * and PRD-defined split: 40% jackpot / 35% four-match / 25% three-match
 */

const POOL_SPLIT = {
  fiveMatch: 0.40,   // Jackpot — rolls over if unclaimed
  fourMatch: 0.35,
  threeMatch: 0.25,
};

// How much of each subscription goes to the prize pool (configurable via env)
const PRIZE_POOL_PERCENTAGE = parseFloat(process.env.PRIZE_POOL_PERCENTAGE || '0.60');
const CHARITY_MINIMUM_PERCENTAGE = parseFloat(process.env.CHARITY_MIN_PERCENTAGE || '0.10');

/**
 * Calculate the total prize pool from active subscribers
 * @param {number} activeSubscriberCount
 * @param {number} subscriptionAmountGBP - monthly plan amount in pence
 * @param {number} rolledOverJackpot - jackpot carried from previous month (in pence)
 * @returns {object} breakdown of prize tiers
 */
const calculatePrizePool = (activeSubscriberCount, subscriptionAmountGBP, rolledOverJackpot = 0) => {
  const totalRevenue = activeSubscriberCount * subscriptionAmountGBP;
  const totalPool = Math.floor(totalRevenue * PRIZE_POOL_PERCENTAGE) + rolledOverJackpot;

  const fiveMatchPool = Math.floor(totalPool * POOL_SPLIT.fiveMatch);
  const fourMatchPool = Math.floor(totalPool * POOL_SPLIT.fourMatch);
  const threeMatchPool = Math.floor(totalPool * POOL_SPLIT.threeMatch);

  return {
    totalPool,
    fiveMatchPool,    // Jackpot
    fourMatchPool,
    threeMatchPool,
    rolledOverJackpot,
    activeSubscribers: activeSubscriberCount,
    // Human-readable (divide pence by 100 for GBP)
    display: {
      totalPool: (totalPool / 100).toFixed(2),
      fiveMatchPool: (fiveMatchPool / 100).toFixed(2),
      fourMatchPool: (fourMatchPool / 100).toFixed(2),
      threeMatchPool: (threeMatchPool / 100).toFixed(2),
    },
  };
};

/**
 * Split a prize tier amount equally among multiple winners
 * @param {number} poolAmount - total amount for this tier (pence)
 * @param {number} winnerCount
 * @returns {number} amount per winner (pence)
 */
const splitAmongWinners = (poolAmount, winnerCount) => {
  if (!winnerCount || winnerCount === 0) return 0;
  return Math.floor(poolAmount / winnerCount);
};

/**
 * Calculate charity contribution for a user
 * @param {number} subscriptionAmount - in pence
 * @param {number} charityPercentage - user-selected % (min 10%)
 * @returns {number} charity amount in pence
 */
const calculateCharityContribution = (subscriptionAmount, charityPercentage) => {
  const pct = Math.max(charityPercentage, CHARITY_MINIMUM_PERCENTAGE * 100) / 100;
  return Math.floor(subscriptionAmount * pct);
};

module.exports = {
  calculatePrizePool,
  splitAmongWinners,
  calculateCharityContribution,
  POOL_SPLIT,
  PRIZE_POOL_PERCENTAGE,
  CHARITY_MINIMUM_PERCENTAGE,
};