require('./database')
const mongoose = require('mongoose')

// Carregar o model Region
require('../api/models/Region')

// Carregar os models
const Specie = mongoose.model('Specie')
const Region = mongoose.model('Region')

const rollbackRegionsCastanheiras = async () => {
  console.log('🔄 Iniciando rollback das regiões castanheiras...')
  
  try {
    // 1. Encontrar a espécie da castanheira
    const castanhaSpecie = await Specie.findOne({
      $or: [
        { popularName: /castanha/i },
        { scientificName: /bertholletia/i }
      ]
    })
    
    if (!castanhaSpecie) {
      console.log('❌ Espécie da castanheira não encontrada. Nada para fazer.')
      return
    }
    
    console.log('✅ Espécie da castanheira encontrada:', castanhaSpecie.popularName, `(ID: ${castanhaSpecie._id})`)

    // 2. Buscar todas as regiões da castanheira
    const existingRegions = await Region.find({ specie: castanhaSpecie._id })
    
    if (existingRegions.length === 0) {
      console.log('📭 Nenhuma região encontrada para a espécie castanheira.')
      return
    }
    
    console.log(`📋 ${existingRegions.length} regiões encontradas para remoção`)
    
    // 3. Listar as regiões que serão removidas
    console.log('\n📍 Regiões que serão removidas:')
    existingRegions.forEach((region, index) => {
      console.log(`   ${index + 1}. ${region.name} (${region.municipalities.length} municípios)`)
    })
    
    // 4. Confirmar a operação (simulação - em produção você pode querer uma confirmação real)
    console.log('\n⚠️  ATENÇÃO: Esta operação irá remover TODAS as regiões da espécie castanheira!')
    console.log('⚠️  Isso inclui regiões que podem ter sido criadas manualmente após a migração.')
    
    // 5. Executar a remoção
    const result = await Region.deleteMany({ specie: castanhaSpecie._id })
    
    // 6. Relatório final
    console.log('\n📈 Relatório do Rollback:')
    console.log(`🗑️  Regiões removidas: ${result.deletedCount}`)
    console.log(`📊 Regiões esperadas: ${existingRegions.length}`)
    
    if (result.deletedCount === existingRegions.length) {
      console.log('\n✅ Rollback concluído com sucesso!')
      console.log('💡 Todas as regiões da castanheira foram removidas do sistema.')
      console.log('💡 Você pode executar a migração novamente se necessário.')
    } else {
      console.log('\n⚠️  Rollback parcialmente concluído.')
      console.log('⚠️  Algumas regiões podem não ter sido removidas.')
    }

  } catch (error) {
    console.error('💥 Erro durante o rollback:', error)
    throw error
  }
}

const rollback = async () => {
  console.log('🚀 Iniciando rollback das regiões castanheiras')
  console.log('📊 Alvo: Todas as regiões da espécie castanheira no MongoDB')
  console.log('⚠️  CUIDADO: Esta operação é irreversível!\n')
  
  try {
    await rollbackRegionsCastanheiras()
    console.log('\n✅ Rollback finalizado!')
  } catch (error) {
    console.error('\n💥 Erro durante o rollback:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

rollback() 