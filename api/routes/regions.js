const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Region = mongoose.model('Region')
const User = mongoose.model('User')
const Organization = mongoose.model('Organization')

const normalizeMunicipalityKey = (name = '', uf = '') =>
  `${String(name).trim().toLowerCase()}::${String(uf).trim().toLowerCase()}`

// Listar todas as regiões (com filtros)
router.get('/', auth.globalManager, async (req, res) => {
  const query = {}
  const { name, specie } = req.query

  if (name) {
    query.name = { $regex: name, $options: 'i' }
  }
  if (specie) {
    query.specie = specie
  }

  try {
    const regions = await Region.find(query).populate(populate(req))
    res.json(regions.map(region => region.data()))
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de regiões: ' + err.message)
  }
})

// Obter uma região por ID
router.get('/:id', auth.authenticated, async (req, res) => {
  try {
    const region = await Region.findById(req.params.id).populate(populate(req))
    if (!region) {
      return res.status(404).send('Região não encontrada.')
    }
    return res.json(region.data())
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao buscar a região: ' + err.message)
  }
})

// Buscar municípios/UFs válidos para criação de usuários.
// Quando organizationId é informado, considera somente espécies dos produtos da organização.
router.get('/municipalities/valid', auth.manager, async (req, res) => {
  try {
    const { organizationId } = req.query
    const regionsQuery = {}

    if (organizationId) {
      if (!mongoose.Types.ObjectId.isValid(organizationId)) {
        return res.status(400).json({ message: 'organizationId inválido.' })
      }

      const organization = await Organization.findById(organizationId)
        .populate({
          path: 'products',
          select: 'specieProduct',
          populate: {
            path: 'specieProduct',
            select: 'specie',
          },
        })
        .lean()

      if (!organization) {
        return res.status(404).json({ message: 'Organização não encontrada.' })
      }

      const specieIds = [
        ...new Set(
          (organization.products || [])
            .map((product) => product?.specieProduct?.specie)
            .filter(Boolean)
            .map((id) => id.toString())
        ),
      ]

      if (specieIds.length === 0) {
        return res.json({
          options: [],
          message:
            'A organização não possui produtos com espécies configuradas para regiões.',
        })
      }

      regionsQuery.specie = { $in: specieIds }
    }

    const regions = await Region.find(regionsQuery, {
      municipalities: 1,
      specie: 1,
      name: 1,
    }).lean()

    const municipalitiesByUf = new Map()
    const municipalityRegionMap = new Map()

    for (const region of regions) {
      for (const municipality of region.municipalities || []) {
        const uf = String(municipality.uf || '').trim().toUpperCase()
        const city = String(municipality.name || '').trim()
        if (!uf || !city) continue

        if (!municipalitiesByUf.has(uf)) {
          municipalitiesByUf.set(uf, new Set())
        }
        municipalitiesByUf.get(uf).add(city)

        const mapKey = normalizeMunicipalityKey(city, uf)
        if (!municipalityRegionMap.has(mapKey)) {
          municipalityRegionMap.set(mapKey, [])
        }
        municipalityRegionMap.get(mapKey).push({
          _id: region._id,
          name: region.name,
          specie: region.specie,
        })
      }
    }

    const options = [...municipalitiesByUf.entries()]
      .sort(([ufA], [ufB]) => ufA.localeCompare(ufB, 'pt-BR'))
      .map(([uf, municipalities]) => ({
        uf,
        municipalities: [...municipalities].sort((a, b) =>
          a.localeCompare(b, 'pt-BR')
        ),
      }))

    const regionMatches = [...municipalityRegionMap.entries()].map(
      ([key, regionsByMunicipality]) => {
        const [city, uf] = key.split('::')
        return {
          city,
          uf: uf.toUpperCase(),
          regions: regionsByMunicipality
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
            .map((region) => ({
              _id: region._id,
              name: region.name,
              specie: region.specie,
            })),
        }
      }
    )

    return res.json({ options, regionMatches })
  } catch (err) {
    return res.status(422).json({
      message: `Ocorreu um erro ao carregar municípios válidos: ${err.message}`,
    })
  }
})

async function validateMunicipalityUniqueness(municipalities, specieId, excludeRegionId = null) {
  if (!municipalities || municipalities.length === 0) {
    return { isValid: true }
  }

  const duplicatesInPayload = new Set()
  const seenMunicipalities = new Set()

  for (const municipality of municipalities) {
    const key = normalizeMunicipalityKey(municipality.name, municipality.uf)
    if (seenMunicipalities.has(key)) {
      duplicatesInPayload.add(`${municipality.name}/${municipality.uf}`)
    } else {
      seenMunicipalities.add(key)
    }
  }

  if (duplicatesInPayload.size > 0) {
    return {
      isValid: false,
      message: `Municípios duplicados na mesma região: ${[
        ...duplicatesInPayload,
      ].join(', ')}`,
    }
  }

  // Buscar todas as regiões da mesma espécie (excluindo a região atual se for uma atualização)
  const query = { specie: specieId }
  if (excludeRegionId) {
    query._id = { $ne: excludeRegionId }
  }

  const existingRegions = await Region.find(query)

  // Verificar se algum município já existe em outra região
  const conflicts = []
  
  for (const municipality of municipalities) {
    for (const region of existingRegions) {
      const existingMunicipality = region.municipalities.find(
        m =>
          normalizeMunicipalityKey(m.name, m.uf) ===
          normalizeMunicipalityKey(municipality.name, municipality.uf)
      )
      
      if (existingMunicipality) {
        conflicts.push({
          municipality: `${municipality.name}/${municipality.uf}`,
          existingRegion: region.name
        })
      }
    }
  }

  if (conflicts.length > 0) {
    const conflictMessages = conflicts.map(
      c => `${c.municipality} já está cadastrado na região "${c.existingRegion}"`
    )
    return {
      isValid: false,
      message: `${conflictMessages.join('; ')}`
    }
  }

  return { isValid: true }
}

// Criar uma nova região
router.post('/', auth.globalManager, async (req, res) => {
  try {
    // Validar se há municípios duplicados na mesma espécie
    const validation = await validateMunicipalityUniqueness(
      req.body.municipalities, 
      req.body.specie
    )
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.message
      })
    }

    const newRegion = new Region(req.body)
    await newRegion.save()
    res.status(201).json(newRegion.data())
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Já existe uma região com este nome para a espécie informada.',
      })
    }
    res.status(422).send('Ocorreu um erro ao criar a região: ' + err.message)
  }
})

// Atualizar uma região
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    // Validar se há municípios duplicados na mesma espécie (excluindo a região atual)
    const validation = await validateMunicipalityUniqueness(
      req.body.municipalities, 
      req.body.specie,
      req.params.id
    )
    
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.message
      })
    }

    const updatedRegion = await Region.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedRegion) {
      return res.status(404).send('Região não encontrada.')
    }

    await User.updateMany(
      { regionId: updatedRegion._id },
      { $set: { region: updatedRegion.name } }
    )

    return res.json(updatedRegion.data())
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Já existe uma região com este nome para a espécie informada.',
      })
    }
    res.status(422).send('Ocorreu um erro ao atualizar a região: ' + err.message)
  }
})

// Deletar uma região
router.delete('/:id', auth.globalManager, async (req, res) => {
  try {
    const deletedRegion = await Region.findByIdAndDelete(req.params.id)

    if (!deletedRegion) {
      return res.status(404).send('Região não encontrada.')
    }

    return res.status(204).send()
  } catch (err) {
    res.status(400).send('Ocorreu um erro ao deletar a região: ' + err.message)
  }
})

// Nova rota: Buscar região por produto e localização do usuário
router.get('/product/:productId/user-location', auth.authenticated, async (req, res) => {
  try {
    const productId = req.params.productId
    const userUf = req.query.uf
    const userCity = req.query.city

    if (!userUf || !userCity) {
      return res.status(400).json({ 
        region: null, 
        message: 'UF e cidade do usuário são obrigatórios' 
      })
    }

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

    if (!product) {
      return res.status(404).json({ region: null, message: 'Produto não encontrado' })
    }

    if (!product.specieProduct?.specie) {
      return res.json({ 
        region: null, 
        message: 'Produto não possui espécie configurada' 
      })
    }

    const specieId = product.specieProduct.specie._id

    // 2. Buscar regiões dessa espécie que contenham o município/UF do usuário
    const regions = await Region.find({
      specie: specieId,
      'municipalities': {
        $elemMatch: {
          name: userCity,
          uf: userUf
        }
      }
    }).populate('specie', 'scientificName popularName')

    if (regions.length === 0) {
      return res.json({ 
        region: null, 
        specie: product.specieProduct.specie
      })
    }

    // 3. Se há apenas uma região, retornar ela
    if (regions.length === 1) {
      return res.json({ 
        region: regions[0].name,
        regionData: regions[0].data(),
        specie: product.specieProduct.specie,
      })
    }

    // 4. Se há múltiplas regiões (caso raro), retornar a primeira
    return res.json({ 
      region: regions[0].name,
      regionData: regions[0].data(),
      specie: product.specieProduct.specie,
      allRegions: regions.map(r => r.data())
    })

  } catch (error) {
    console.error('Erro ao buscar região por produto e localização:', error)
    res.status(422).json({ 
      region: null, 
      message: 'Erro ao buscar região: ' + error.message 
    })
  }
})

module.exports = router 