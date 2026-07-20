// Displays 1000g/1000ml as 1kg/1L instead of the raw stored unit — purely cosmetic,
// the underlying stored value/unit pair is unchanged.
export function formatWeight(weight, unit) {
  const value = Number(weight);
  if (!Number.isFinite(value)) return `${weight ?? ''} ${unit || ''}`.trim();

  const lowerUnit = (unit || '').toLowerCase();
  const trimTrailingZeros = (n) => Number(n.toFixed(2)).toString();

  if (lowerUnit === 'g' && value >= 1000) {
    return `${trimTrailingZeros(value / 1000)} kg`;
  }
  if (lowerUnit === 'ml' && value >= 1000) {
    return `${trimTrailingZeros(value / 1000)} L`;
  }
  return `${weight} ${unit || ''}`.trim();
}
