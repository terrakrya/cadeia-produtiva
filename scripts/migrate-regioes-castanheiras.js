require('./database')
const regiao = require('../data/regioes-castanheiras.json')

const mongoose = require('mongoose')
const User = mongoose.model('User')

const migrateDocuments = async () => {
  console.log('🔍 INICIANDO MIGRAÇÃO DE REGIÕES CASTANHEIRAS')
  console.log('═'.repeat(60))
  
  // Buscar TODOS os usuários que têm cidade (independente da região atual)
  console.log('📋 Buscando usuários para análise...')
  const allUsers = await User.find({ 
    city: { $exists: true, $ne: null, $ne: '' } 
  }).select('name city region')
  
  console.log(`👥 Total de usuários encontrados: ${allUsers.length}`)
  console.log('─'.repeat(40))

  let stats = {
    analyzed: 0,
    updated: 0,
    alreadyCorrect: 0,
    noRegionFound: 0,
    errors: 0
  }

  let detailedLogs = {
    updated: [],
    alreadyCorrect: [],
    noRegionFound: [],
    errors: []
  }

  for (const user of allUsers) {
    stats.analyzed++
    
    // Buscar a região correta para esta cidade
    const [regiaoCorreta] = regiao.filter(function (item) {
      return item.municipio === user.city
    })

    if (regiaoCorreta) {
      const regiaoEsperada = regiaoCorreta.regiaoCastanheira
      const regiaoAtual = user.region

      if (regiaoAtual !== regiaoEsperada) {
        // Precisa atualizar
        try {
          await user.updateOne({
            $set: { region: regiaoEsperada },
          })
          
          console.log(`✅ ${user.name} (${user.city})`)
          console.log(`   "${regiaoAtual || 'sem região'}" → "${regiaoEsperada}"`)
          
          stats.updated++
          detailedLogs.updated.push({
            name: user.name,
            city: user.city,
            from: regiaoAtual || 'sem região',
            to: regiaoEsperada
          })
        } catch (error) {
          console.log(`❌ ERRO - ${user.name} (${user.city}): ${error.message}`)
          stats.errors++
          detailedLogs.errors.push({
            name: user.name,
            city: user.city,
            error: error.message
          })
        }
      } else {
        // Já está correto
        console.log(`🔘 ${user.name} (${user.city}) → já correto: "${regiaoAtual}"`)
        stats.alreadyCorrect++
        detailedLogs.alreadyCorrect.push({
          name: user.name,
          city: user.city,
          region: regiaoAtual
        })
      }
    } else {
      // Cidade não encontrada no arquivo de regiões
      console.log(`⚠️  ${user.name} (${user.city}) → cidade não encontrada nas regiões`)
      stats.noRegionFound++
      detailedLogs.noRegionFound.push({
        name: user.name,
        city: user.city,
        currentRegion: user.region || 'sem região'
      })
    }
  }

  // Relatório final detalhado
  console.log('\n' + '═'.repeat(60))
  console.log('📊 RELATÓRIO FINAL DA MIGRAÇÃO')
  console.log('═'.repeat(60))
  
  console.log(`📈 Usuários analisados: ${stats.analyzed}`)
  console.log(`✅ Usuários atualizados: ${stats.updated}`)
  console.log(`🔘 Já estavam corretos: ${stats.alreadyCorrect}`)
  console.log(`⚠️  Sem região encontrada: ${stats.noRegionFound}`)
  console.log(`❌ Erros: ${stats.errors}`)

  // Seção de atualizações
  if (detailedLogs.updated.length > 0) {
    console.log('\n🎉 USUÁRIOS ATUALIZADOS:')
    console.log('─'.repeat(40))
    detailedLogs.updated.forEach(log => {
      console.log(`   👤 ${log.name} (${log.city})`)
      console.log(`      📍 "${log.from}" → "${log.to}"`)
    })
  }

  // Seção de problemas
  if (detailedLogs.noRegionFound.length > 0) {
    console.log('\n⚠️  CIDADES SEM REGIÃO ENCONTRADA:')
    console.log('─'.repeat(40))
    detailedLogs.noRegionFound.forEach(log => {
      console.log(`   👤 ${log.name} - Cidade: "${log.city}" (atual: ${log.currentRegion})`)
    })
    console.log('💡 Estas cidades podem precisar ser adicionadas ao arquivo regioes-castanheiras.json')
  }

  // Seção de erros
  if (detailedLogs.errors.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:')
    console.log('─'.repeat(40))
    detailedLogs.errors.forEach(log => {
      console.log(`   👤 ${log.name} (${log.city}) - ${log.error}`)
    })
  }

  // Resumo final
  console.log('\n' + '═'.repeat(60))
  if (stats.updated > 0) {
    console.log(`🎯 MIGRAÇÃO CONCLUÍDA! ${stats.updated} usuário(s) atualizado(s)`)
  } else {
    console.log('✨ TUDO CERTO! Nenhuma atualização necessária')
  }
  console.log('═'.repeat(60))
}

const migrateRegiaoesCastanheiras = async () => {
  console.log('🚀 SISTEMA DE MIGRAÇÃO DE REGIÕES CASTANHEIRAS')
  console.log('📅 Data/Hora:', new Date().toLocaleString('pt-BR'))
  console.log('')
  
  try {
    await migrateDocuments()
    console.log('\n✅ Processo finalizado com sucesso!')
  } catch (error) {
    console.log('\n💥 ERRO CRÍTICO:', error.message)
    console.error(error)
    process.exit(1)
  }
  
  process.exit(0)
}

migrateRegiaoesCastanheiras()
