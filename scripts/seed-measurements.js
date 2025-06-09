require('./database')
const mongoose = require('mongoose')
const Measurement = mongoose.model('Measurement')
const Specie = mongoose.model('Specie')

const seedMeasurements = async () => {
  console.log('🌱 Iniciando seed de measurements básicas...')
  
  // Buscar a espécie da castanha (assumindo que existe)
  const castanhaSpecie = await Specie.findOne({
    $or: [
      { popularName: /castanha/i },
      { scientificName: /bertholletia/i }
    ]
  })
  
  if (!castanhaSpecie) {
    console.log('❌ Espécie da castanha não encontrada. Criando uma básica...')
    
    const newSpecie = new Specie({
      scientificName: 'Bertholletia excelsa',
      popularName: 'Castanha-do-pará'
    })
    await newSpecie.save()
    
    console.log('✅ Espécie da castanha criada:', newSpecie._id)
    castanhaSpecie = newSpecie
  } else {
    console.log('✅ Espécie da castanha encontrada:', castanhaSpecie.popularName)
  }
  
  // Measurements básicas para a castanha
  const basicMeasurements = [
    { name: 'Kg', referenceInKg: 1 },
    { name: 'Lata', referenceInKg: 12 },
    { name: 'Caixa', referenceInKg: 24 },
    { name: 'Hectolitro', referenceInKg: 60 },
    { name: 'Saca', referenceInKg: 48 },
    { name: 'Barrica', referenceInKg: 72 },
    { name: 'Tonelada', referenceInKg: 1000 }
  ]
  
  let createdCount = 0
  let existingCount = 0
  
  for (const measurementData of basicMeasurements) {
    try {
      // Verificar se já existe
      const existing = await Measurement.findOne({
        name: measurementData.name,
        specie: castanhaSpecie._id,
        deletedAt: null
      })
      
      if (existing) {
        console.log(`⚪ Measurement "${measurementData.name}" já existe`)
        existingCount++
      } else {
        // Criar nova measurement
        const measurement = new Measurement({
          name: measurementData.name,
          referenceInKg: measurementData.referenceInKg,
          specie: castanhaSpecie._id
        })
        
        await measurement.save()
        console.log(`✅ Measurement criada: ${measurementData.name} = ${measurementData.referenceInKg}kg`)
        createdCount++
      }
    } catch (error) {
      console.error(`💥 Erro ao criar measurement "${measurementData.name}":`, error.message)
    }
  }
  
  console.log('\n📈 Relatório do Seed:')
  console.log(`✅ Measurements criadas: ${createdCount}`)
  console.log(`⚪ Measurements já existentes: ${existingCount}`)
  console.log(`📊 Total processadas: ${basicMeasurements.length}`)
}

const seed = async () => {
  console.log('🚀 Iniciando seed de measurements básicas')
  try {
    await seedMeasurements()
    console.log('✅ Seed de measurements finalizado com sucesso')
  } catch (error) {
    console.error('💥 Erro durante o seed:', error)
  }
  process.exit()
}

seed() 