const mongoose = require('mongoose')

// Função de conversão dinâmica simplificada - apenas measurementId
const convertUnitDynamic = async (value, user) => {
  try {
    // Validar entrada
    if (!value || isNaN(value)) {
      return '0.00'
    }

    // measurementId obrigatório
    if (!user.measurementId) {
      throw new Error(`Usuário ${user.name || user._id} não possui measurementId configurado`)
    }

    const Measurement = mongoose.model('Measurement')
    const measurement = await Measurement.findById(user.measurementId)
    
    if (!measurement || !measurement.referenceInKg) {
      throw new Error(`Measurement não encontrado: ${user.measurementId}`)
    }

    return (value * measurement.referenceInKg).toFixed(2)
  } catch (error) {
    throw error // Propagar erro ao invés de fallback silencioso
  }
}

module.exports = convertUnitDynamic 