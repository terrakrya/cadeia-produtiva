const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Region = mongoose.model('Region')

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

// Criar uma nova região
router.post('/', auth.globalManager, async (req, res) => {
  try {
    const newRegion = new Region(req.body)
    await newRegion.save()
    res.status(201).json(newRegion.data())
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao criar a região: ' + err.message)
  }
})

// Atualizar uma região
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const updatedRegion = await Region.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedRegion) {
      return res.status(404).send('Região não encontrada.')
    }

    return res.json(updatedRegion.data())
  } catch (err) {
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