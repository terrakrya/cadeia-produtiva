require('./database')
const mongoose = require('mongoose')
const PriceInformation = mongoose.model('PriceInformation')

const rollbackDocuments = async () => {
  console.log('🔄 Iniciando rollback de measurementId...')
  
  // Buscar todos os PriceInformation com measurementId
  const pricesWithMeasurementId = await PriceInformation.find({
    measurementId: { $ne: null }
  })
  
  console.log(`📊 Encontrados ${pricesWithMeasurementId.length} registros para rollback`)
  
  if (pricesWithMeasurementId.length === 0) {
    console.log('✅ Nenhum registro para fazer rollback')
    return
  }
  
  // Confirmar ação
  console.log('⚠️  ATENÇÃO: Esta ação irá remover todos os measurementId dos registros de PriceInformation!')
  console.log('⚠️  Isso fará com que o sistema volte a usar apenas as medidas hard coded.')
  
  let rollbackCount = 0
  let errorCount = 0
  
  for (const price of pricesWithMeasurementId) {
    try {
      // Remover measurementId
      await PriceInformation.updateOne(
        { _id: price._id },
        { $unset: { measurementId: 1 } }
      )
      
      console.log(`✅ Rollback: measurementId removido do preço ${price._id}`)
      rollbackCount++
    } catch (error) {
      console.error(`💥 Erro ao fazer rollback do preço ${price._id}:`, error.message)
      errorCount++
    }
  }
  
  console.log('\n📈 Relatório de Rollback:')
  console.log(`✅ Rollbacks realizados: ${rollbackCount}`)
  console.log(`💥 Erros: ${errorCount}`)
  console.log(`📊 Total processados: ${pricesWithMeasurementId.length}`)
}

const rollbackMeasurements = async () => {
  console.log('🔄 Iniciando rollback de measurementId em PriceInformation')
  try {
    await rollbackDocuments()
    console.log('✅ Rollback de measurementId finalizado com sucesso')
  } catch (error) {
    console.error('💥 Erro durante o rollback:', error)
  }
  process.exit()
}

rollbackMeasurements() 