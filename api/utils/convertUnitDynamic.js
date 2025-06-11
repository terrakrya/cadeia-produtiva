const mongoose = require('mongoose')

// Função de conversão dinâmica que considera measurementId do usuário
const convertUnitDynamic = async (value, user) => {
  try {
    // Validar entrada
    if (!value || isNaN(value)) {
      return '0.00'
    }

    // 1. Tentar usar measurementId do usuário se disponível
    if (user.measurementId) {
      const Measurement = mongoose.model('Measurement')
      const measurement = await Measurement.findById(user.measurementId)
      
      if (measurement && measurement.referenceInKg) {
        return (value * measurement.referenceInKg).toFixed(2)
      }
    }

    // 2. Fallback para unitOfMeasurement estático
    return convertUnitFallback(value, user.unitOfMeasurement)
  } catch (error) {
    return convertUnitFallback(value, user.unitOfMeasurement)
  }
}

// Tabela de conversão estática para fallback
const conversionTable = {
  Lata: 12,
  Kg: 1,
  Caixa: 24,
  Saca: 48,
  Hectolitro: 60,
  Barrica: 72,
  Tonelada: 1000,
}

const convertUnitFallback = (value, toUnit) => {
  if (!(toUnit in conversionTable)) {
    return (value * 1).toFixed(2) // Default to Kg
  }
  return (value * conversionTable[toUnit]).toFixed(2)
}

module.exports = convertUnitDynamic 