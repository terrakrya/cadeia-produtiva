const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const Measurement = mongoose.model('Measurement')

// Helper function to capitalize each word
function capitalizeName(name) {
  if (!name || typeof name !== 'string') return ''
  return name
    .trim()
    .split(' ')
    .filter((word) => word.length > 0) // Remove empty words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Create a new measurement for a specific species
router.post('/', auth.globalManager, async (req, res) => {
  try {
    const { name, specie, referenceInKg } = req.body

    // Validate name
    if (!name || !name.trim()) {
      return res.status(422).send('O nome da unidade é obrigatório.')
    }

    // Validate referenceInKg
    if (!referenceInKg || referenceInKg <= 0) {
      return res.status(422).send('A referência em Kg deve ser maior que zero.')
    }

    // Capitalize the name for standardization
    const capitalizedName = capitalizeName(name)
    console.log('Capitalized name:', capitalizedName)

    // Check if a measurement with the same name already exists for this species
    const existingMeasurement = await Measurement.findOne({
      name: capitalizedName,
      specie: specie,
      deletedAt: null, // ← IGNORA registros soft deleted
    })

    console.log('Existing measurement found:', existingMeasurement)

    if (existingMeasurement) {
      return res
        .status(422)
        .send(
          `Já existe uma unidade de medida "${capitalizedName}" para esta espécie. Escolha um nome diferente.`
        )
    }

    const measurement = new Measurement({
      ...req.body,
      name: capitalizedName,
      referenceInKg: parseFloat(referenceInKg),
    })

    console.log('Measurement before save:', measurement)

    await measurement.save()

    console.log('Measurement after save:', measurement)
    console.log('=== END DEBUG ===')

    res.status(201).json(measurement)
  } catch (err) {
    console.error('Error in measurement creation:', err)
    res.status(422).send('Erro ao criar unidade de medida: ' + err.message)
  }
})

// Get all measurements for a specific species
router.get('/species/:specieId', auth.authenticated, async (req, res) => {
  try {
    let query = Measurement.find({ specie: req.params.specieId })

    // Por padrão, filtrar registros deletados
    if (req.query.includeDeleted !== 'true') {
      query = query.notDeleted()
    }

    const measurements = await query.exec()
    res.json(measurements)
  } catch (err) {
    res.status(422).send('Erro ao buscar unidades de medida: ' + err.message)
  }
})

// Get a specific measurement by ID
router.get('/:id', auth.globalManager, async (req, res) => {
  try {
    let query = Measurement.findById(req.params.id)

    // Por padrão, filtrar registros deletados
    if (req.query.includeDeleted !== 'true') {
      query = query.notDeleted()
    }

    const measurement = await query.exec()
    if (!measurement) {
      return res.status(404).json({ error: 'Unidade de medida não encontrada' })
    }
    res.json(measurement)
  } catch (err) {
    res.status(422).send('Erro ao buscar unidade de medida: ' + err.message)
  }
})

// Update a measurement
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const { name, specie, referenceInKg } = req.body
    const measurementId = req.params.id

    console.log('=== MEASUREMENT UPDATE DEBUG ===')
    console.log('Original name:', name)
    console.log('Original specie:', specie)
    console.log('Original referenceInKg:', referenceInKg)
    console.log('Measurement ID:', measurementId)

    // Validate name
    if (!name || !name.trim()) {
      return res.status(422).send('O nome da unidade é obrigatório.')
    }

    // Validate referenceInKg
    if (!referenceInKg || referenceInKg <= 0) {
      return res.status(422).send('A referência em Kg deve ser maior que zero.')
    }

    // Capitalize the name for standardization
    const capitalizedName = capitalizeName(name)
    console.log('Capitalized name:', capitalizedName)

    // Check if a measurement with the same name already exists for this species (excluding the current one)
    const existingMeasurement = await Measurement.findOne({
      name: capitalizedName,
      specie: specie,
      _id: { $ne: measurementId },
      deletedAt: null, // ← IGNORA registros soft deleted
    })

    console.log('Existing measurement found:', existingMeasurement)

    if (existingMeasurement) {
      return res
        .status(422)
        .send(
          `Já existe uma unidade de medida "${capitalizedName}" para esta espécie. Escolha um nome diferente.`
        )
    }

    console.log('Update data:', {
      ...req.body,
      name: capitalizedName,
      referenceInKg: parseFloat(referenceInKg),
    })

    const measurement = await Measurement.findByIdAndUpdate(
      measurementId,
      {
        ...req.body,
        name: capitalizedName,
        referenceInKg: parseFloat(referenceInKg),
      },
      { new: true }
    )

    console.log('Updated measurement:', measurement)
    console.log('=== END UPDATE DEBUG ===')

    if (!measurement) {
      return res.status(404).json({ error: 'Unidade de medida não encontrada' })
    }
    res.json(measurement)
  } catch (err) {
    console.error('Error in measurement update:', err)
    res.status(422).send('Erro ao atualizar unidade de medida: ' + err.message)
  }
})

// Delete a measurement (com verificação de uso e soft delete)
router.delete('/:id', auth.globalManager, async (req, res) => {
  try {
    const measurementId = req.params.id

    // Verificar se a measurement existe
    const measurement = await Measurement.findById(measurementId)
    if (!measurement) {
      return res.status(404).json({ error: 'Unidade de medida não encontrada' })
    }

    // Se já está soft deleted, não fazer nada
    if (measurement.isDeleted()) {
      return res
        .status(410)
        .json({ error: 'Unidade de medida já foi removida' })
    }

    // Verificar se está sendo usada em PriceInformations
    const PriceInformation = mongoose.model('PriceInformation')
    const usageCount = await PriceInformation.countDocuments({
      measurementId: measurementId,
    })

    if (usageCount > 0) {
      // ← SOFT DELETE: Se estiver em uso, aplicar soft delete
      await measurement.softDelete()
      return res.status(200).json({
        message: `Unidade de medida "${measurement.name}" foi removida do sistema, mas mantida para preservar o histórico de ${usageCount} registro(s) de preço.`,
        softDeleted: true,
        usageCount: usageCount,
      })
    } else {
      // ← DELETE FÍSICO: Se não estiver em uso, pode deletar completamente
      await Measurement.findByIdAndDelete(measurementId)
      return res.status(200).json({
        message: `Unidade de medida "${measurement.name}" foi excluída permanentemente.`,
        deleted: true,
      })
    }
  } catch (err) {
    console.error('Erro ao excluir measurement:', err)
    res.status(422).send('Erro ao excluir unidade de medida: ' + err.message)
  }
})

// ← NOVO: Carregar medidas de todas as espécies da organização do usuário
router.get('/organization/:organizationId', auth.authenticated, async (req, res) => {
  try {
    const organizationId = req.params.organizationId
    
    console.log('🔍 Buscando medidas para organização:', organizationId)

    // 1. Buscar organização com produtos populados
    const Organization = mongoose.model('Organization')
    const SpeciesProduct = mongoose.model('SpeciesProduct')
    const Product = mongoose.model('Product')
    
    const organization = await Organization
      .findById(organizationId)
      .populate({
        path: 'products',
        populate: {
          path: 'specieProduct',
          populate: {
            path: 'specie',
            select: 'scientificName popularName'
          }
        }
      })

    console.log('📋 Organização encontrada:', {
      id: organization?._id,
      name: organization?.name,
      productsCount: organization?.products?.length
    })

    if (!organization) {
      return res.status(404).send('Organização não encontrada')
    }

    // 2. Extrair todas as espécies dos produtos da organização
    const speciesIds = []
    const speciesInfo = []
    
    organization.products.forEach(product => {
      if (product.specieProduct?.specie?._id) {
        const specieId = product.specieProduct.specie._id
        if (!speciesIds.includes(specieId.toString())) {
          speciesIds.push(specieId)
          speciesInfo.push({
            id: specieId,
            name: product.specieProduct.specie.popularName,
            productName: product.name
          })
        }
      }
    })

    console.log('🌿 Espécies encontradas:', speciesInfo)

    if (speciesIds.length === 0) {
      console.log('⚠️ Nenhuma espécie encontrada')
      return res.json([])
    }

    // 3. ← ADICIONAR ORDENAÇÃO: Buscar medidas ordenadas por referenceInKg
    const measurements = await Measurement.find({
      specie: { $in: speciesIds },
      deletedAt: null
    })
    .populate('specie', 'scientificName popularName')
    .sort({ referenceInKg: 1 }) // ← ORDENAR: crescente por kg

    console.log('📏 Medidas encontradas:', measurements.map(m => ({
      name: m.name,
      referenceInKg: m.referenceInKg,
      specie: m.specie.popularName
    })))

    // 4. ← NOVA LÓGICA: Detectar conflitos corretamente
    const measurementsByName = new Map()
    
    // Primeiro, agrupar por nome para detectar conflitos
    measurements.forEach(measurement => {
      const name = measurement.name
      
      if (!measurementsByName.has(name)) {
        measurementsByName.set(name, [])
      }
      
      measurementsByName.get(name).push(measurement)
    })

    // Segundo, processar cada grupo para detectar conflitos
    const finalMeasurements = []
    
    measurementsByName.forEach((measurementGroup, name) => {
      if (measurementGroup.length === 1) {
        // ← SEM CONFLITO: Apenas uma medida com este nome
        const measurement = measurementGroup[0]
        finalMeasurements.push({
          _id: measurement._id,
          name: measurement.name,
          originalName: measurement.name,
          referenceInKg: measurement.referenceInKg,
          specie: measurement.specie,
          hasConflict: false
        })
      } else {
        // ← VERIFICAR CONFLITOS: Múltiplas medidas com mesmo nome
        const uniqueReferences = new Set(measurementGroup.map(m => m.referenceInKg))
        
        if (uniqueReferences.size === 1) {
          // ← MESMO PESO: Todas têm a mesma referência, usar apenas uma
          const measurement = measurementGroup[0]
          finalMeasurements.push({
            _id: measurement._id,
            name: measurement.name,
            originalName: measurement.name,
            referenceInKg: measurement.referenceInKg,
            specie: measurement.specie,
            hasConflict: false
          })
        } else {
          // ← PESOS DIFERENTES: Conflito real, especificar por espécie
          measurementGroup.forEach(measurement => {
            finalMeasurements.push({
              _id: measurement._id,
              name: `${measurement.name} (${measurement.specie.popularName})`,
              originalName: measurement.name,
              referenceInKg: measurement.referenceInKg,
              specie: measurement.specie,
              hasConflict: true
            })
          })
        }
      }
    })

    // ← ADICIONAR: Ordenar array final também
    finalMeasurements.sort((a, b) => a.referenceInKg - b.referenceInKg)

    console.log('✅ Medidas finais processadas (ordenadas):', finalMeasurements.map(m => ({
      name: m.name,
      originalName: m.originalName,
      referenceInKg: m.referenceInKg,
      hasConflict: m.hasConflict,
      specie: m.specie.popularName
    })))

    res.json(finalMeasurements)
  } catch (err) {
    console.error('❌ Erro ao buscar medidas da organização:', err)
    res.status(422).send('Erro ao buscar medidas da organização: ' + err.message)
  }
})

// ← NOVO: Carregar medidas por produto específico
router.get('/product/:productId', auth.authenticated, async (req, res) => {
  try {
    const productId = req.params.productId
    
    console.log('🔍 Buscando medidas para produto:', productId)

    // 1. Buscar produto com espécie
    const Product = mongoose.model('Product')
    const product = await Product.findById(productId)
      .populate({
        path: 'specieProduct',
        populate: {
          path: 'specie',
          select: 'scientificName popularName'
        }
      })

    console.log('📦 Produto encontrado:', {
      id: product?._id,
      name: product?.name,
      specie: product?.specieProduct?.specie?.popularName
    })

    if (!product) {
      return res.status(404).send('Produto não encontrado')
    }

    if (!product.specieProduct?.specie) {
      console.log('⚠️ Produto sem espécie vinculada')
      return res.json([])
    }

    const specieId = product.specieProduct.specie._id

    // 2. Buscar medidas apenas desta espécie
    const measurements = await Measurement.find({
      specie: specieId,
      deletedAt: null
    }).populate('specie', 'scientificName popularName')

    console.log('📏 Medidas encontradas:', measurements.map(m => ({
      name: m.name,
      referenceInKg: m.referenceInKg,
      specie: m.specie.popularName
    })))

    // 3. Como são medidas de uma única espécie, não haverá conflitos de nome
    // Mas ainda vamos formatar adequadamente
    const formattedMeasurements = measurements.map(measurement => ({
      _id: measurement._id,
      name: measurement.name,
      originalName: measurement.name,
      referenceInKg: measurement.referenceInKg,
      hasConflict: false, // Uma espécie = sem conflitos
      specie: {
        _id: measurement.specie._id,
        name: measurement.specie.popularName
      }
    }))

    console.log('✅ Medidas finais processadas:', formattedMeasurements)

    res.json(formattedMeasurements)
  } catch (error) {
    console.error('❌ Erro ao carregar medidas do produto:', error)
    res.status(422).send('Erro ao carregar medidas: ' + error.message)
  }
})

module.exports = router
