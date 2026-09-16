export const parseFeeRange = (rangeStr) => {
  if (!rangeStr || typeof rangeStr !== 'string') return null;

  if (rangeStr === "More than 5 Lakh") return { min: 500000, max: Infinity };

  if (!rangeStr.includes("-")) {
    const number = parseFloat(rangeStr.replace(/[^0-9.]/g, ''));
    return isNaN(number) ? null : { min: number * 100000, max: number * 100000 };
  }

  const cleaned = rangeStr.replace(/Lakh/g, '00000');
  const [minStr, maxStr] = cleaned.split('-').map(str =>
    parseInt(str.trim().replace(/,/g, ''), 10)
  );

  return { min: minStr || 0, max: maxStr || Infinity };
};

export const parseClassLevel = (classStr) => {
  if (classStr === null || classStr === undefined) return null;
  if (typeof classStr === 'number') return classStr;
  const str = String(classStr).trim().toLowerCase();
  if (str === 'nursery' || str === 'lkg' || str === 'ukg' || str === 'kg' || str === 'pre-primary') {
    return 0;
  }
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};
