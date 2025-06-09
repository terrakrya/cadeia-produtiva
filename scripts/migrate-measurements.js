require('./database')
const mongoose = require('mongoose')
const PriceInformation = mongoose.model('PriceInformation')
const Measurement = mongoose.model('Measurement')
const Product = mongoose.model('Product')

const migrateDocuments = async () => {
  console.log('🔍 Iniciando migração de measurementId...')
  
  // Buscar todos os PriceInformation sem measurementId
  const pricesWithoutMeasurementId = await PriceInformation.find({
    measurementId: null
  }).populate({
    path: 'product',
    populate: {
      path: 'specieProduct',
      populate: {
        path: 'specie'
      }
    }
  })
  
  console.log(`📊 Encontrados ${pricesWithoutMeasurementId.length} registros para migrar`)
  
  let migratedCount = 0
  let notFoundCount = 0
  let errorCount = 0
  
  for (const price of pricesWithoutMeasurementId) {
    try {
      // Verificar se o produto tem espécie configurada
      if (!price.product?.specieProduct?.specie?._id) {
        console.log(`⚠️  Produto ${price.product?.name || 'N/A'} não tem espécie configurada`)
        notFoundCount++
        continue
      }
      
      const specieId = price.product.specieProduct.specie._id
      const measureName = price.measure
      
      // Buscar measurement correspondente
      const measurement = await Measurement.findOne({
        name: measureName,
        specie: specieId,
        deletedAt: null
      })
      
      if (measurement) {
        // Atualizar PriceInformation com measurementId
        await PriceInformation.updateOne(
          { _id: price._id },
          { $set: { measurementId: measurement._id } }
        )
        
        console.log(`✅ Migrado: ${measureName} → ${measurement._id} (Preço ID: ${price._id})`)
        migratedCount++
      } else {
        console.log(`❌ Measurement não encontrada: "${measureName}" para espécie ${price.product.specieProduct.specie.popularName}`)
        notFoundCount++
      }
    } catch (error) {
      console.error(`💥 Erro ao migrar preço ${price._id}:`, error.message)
      errorCount++
    }
  }
  
  console.log('\n📈 Relatório de Migração:')
  console.log(`✅ Migrados com sucesso: ${migratedCount}`)
  console.log(`❌ Measurements não encontradas: ${notFoundCount}`)
  console.log(`💥 Erros: ${errorCount}`)
  console.log(`📊 Total processados: ${pricesWithoutMeasurementId.length}`)
}

const migrateMeasurements = async () => {
  console.log('🚀 Iniciando migração de measurementId em PriceInformation')
  try {
    await migrateDocuments()
    console.log('✅ Migração de measurementId finalizada com sucesso')
  } catch (error) {
    console.error('💥 Erro durante a migração:', error)
  }
  process.exit()
}

migrateMeasurements() 