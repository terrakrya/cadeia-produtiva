const Decimal = require('decimal.js');

const conversionTable = {
  Lata: 12,
  Kg: 1,
  Caixa: 24,
  Saca: 48,
  Hectolitro: 60,
  Barrica: 72,
  Tonelada: 1000,
};

function convertUnit(value, toUnit) {
  if (!(toUnit in conversionTable)) {
    return null;
  }
  return new Decimal(value * conversionTable[toUnit]).toFixed(2);
}

module.exports = convertUnit;
