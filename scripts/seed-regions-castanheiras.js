require('./database')
const mongoose = require('mongoose')
const regionsData = require('../data/regioes-castanheiras.json')

// Carregar o model Region que não estava no database.js dos scripts
require('../api/models/Region')

// Carregar os models
const Specie = mongoose.model('Specie')
const Region = mongoose.model('Region')

const seedRegionsCastanheiras = async () => {
  console.log('🌱 Iniciando migração das regiões castanheiras...')
  
  try {
    // 1. Encontrar a espécie da castanheira
    const castanhaSpecie = await Specie.findOne({
      $or: [
        { popularName: /castanha/i },
        { scientificName: /bertholletia/i }
      ]
    })
    
    if (!castanhaSpecie) {
      console.log('❌ Espécie Castanha-da-amazônia não encontrada.')
      return
    }

    // 2. Agrupar municípios por região castanheira
    const groupedRegions = regionsData.reduce((acc, item) => {
      const regionName = item.regiaoCastanheira
      if (!acc[regionName]) {
        acc[regionName] = []
      }
      acc[regionName].push({
        name: item.municipio,
        state: item.estado,
        uf: item.uf
      })
      return acc
    }, {})

    console.log(`📍 ${Object.keys(groupedRegions).length} regiões encontradas no arquivo JSON`)

    // 3. Verificar regiões já existentes
    const existingRegions = await Region.find({ specie: castanhaSpecie._id })
    console.log(`📋 ${existingRegions.length} regiões já existem no banco para esta espécie`)

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0

    // 4. Inserir ou atualizar regiões no banco de dados
    for (const regionName in groupedRegions) {
      const municipalities = groupedRegions[regionName]

      try {
        // Verificar se a região já existe
        const existingRegion = await Region.findOne({
          name: regionName,
          specie: castanhaSpecie._id
        })

        const regionData = {
          name: regionName,
          specie: castanhaSpecie._id,
          municipalities: municipalities,
          isActive: true
        }

        if (existingRegion) {
          // Atualizar região existente
          await Region.findByIdAndUpdate(existingRegion._id, regionData)
          console.log(`🔄 Região "${regionName}" atualizada (${municipalities.length} municípios)`)
          updatedCount++
        } else {
          // Criar nova região
          const newRegion = new Region(regionData)
          await newRegion.save()
          console.log(`✅ Região "${regionName}" criada (${municipalities.length} municípios)`)
          createdCount++
        }
      } catch (error) {
        console.error(`💥 Erro ao processar região "${regionName}":`, error.message)
        skippedCount++
      }
    }

    // 5. Relatório final
    console.log('\n📈 Relatório da Migração:')
    console.log(`✅ Regiões criadas: ${createdCount}`)
    console.log(`🔄 Regiões atualizadas: ${updatedCount}`)
    console.log(`❌ Regiões com erro: ${skippedCount}`)
    console.log(`📊 Total processadas: ${Object.keys(groupedRegions).length}`)
    
    if (createdCount > 0 || updatedCount > 0) {
      console.log('\n🎉 Migração concluída com sucesso!')
      console.log('💡 As regiões castanheiras agora estão disponíveis dinamicamente no sistema.')
      console.log('💡 Você pode gerenciá-las através da interface de cada espécie.')
    }

  } catch (error) {
    console.error('💥 Erro durante a migração:', error)
    throw error
  }
}

const migrate = async () => {
  console.log('🚀 Iniciando migração das regiões castanheiras para o modelo dinâmico')
  console.log('📂 Fonte: data/regioes-castanheiras.json')
  console.log('📊 Destino: Modelo Region no MongoDB\n')
  
  try {
    await seedRegionsCastanheiras()
    console.log('\n✅ Migração finalizada com sucesso!')
  } catch (error) {
    console.error('\n💥 Erro durante a migração:', error)
    process.exit(1)
  }
  
  process.exit(0)
}

migrate() 