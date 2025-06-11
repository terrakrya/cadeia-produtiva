const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const populate = require('../config/utils').populate
const Product = mongoose.model('Product')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}
  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.description) {
    query.description = filters.description
  }

  try {
    let productQuery = Product.find(query)

    // Se precisar de espécies (para carregar medidas dinamicamente)
    if (filters.populate === 'specie' || filters.populate === 'full') {
      productQuery = productQuery.populate({
        path: 'specieProduct',
        populate: {
          path: 'specie',
          select: 'scientificName popularName',
        },
      })
    } else {
      // Comportamento padrão (mantém compatibilidade)
      productQuery = productQuery.populate('specieProduct').populate('type')
    }

    const products = await productQuery.exec()
    res.json(products)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de produto: ' + err.message)
  }
})

router.get('/cadastro-de-produtos', auth.globalManager, async (req, res) => {
  const query = {}

  // ***** monta os filtros *****

  const filters = req.query

  if (filters.id) {
    query._id = filters.id
  }

  if (filters.description) {
    query.description = filters.description
  }

  try {
    // ***** executa a query *****

    const product = await Product.find(query)
      .populate('specieProduct')
      .populate('type')

    res.json(product)
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao carregar a lista de produto: ' + err.message)
  }
})

router.get('/organization/:organizationId', auth.authenticated, async (req, res) => {
  try {
    const organizationId = req.params.organizationId
    
    console.log('🏢 Buscando produtos para organização:', organizationId)

    // Buscar organização e popular seus produtos
    const Organization = mongoose.model('Organization')
    
    const organization = await Organization
      .findById(organizationId)
      .populate({
        path: 'products',
        populate: {
          path: 'specieProduct',
          populate: {
            path: 'specie',
            select: 'scientificName popularName',
          },
        },
      })
      .lean()

    console.log('📋 Organização encontrada:', {
      id: organization?._id,
      name: organization?.name,
      productsCount: organization?.products?.length
    })

    if (!organization) {
      return res.status(404).send('Organização não encontrada')
    }

    // Usar products da organização diretamente
    const products = organization.products || []

    console.log('📦 Produtos encontrados:', products.length)

    // Formatar para o frontend
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      specieProduct: product.specieProduct,
      specie: product.specieProduct?.specie
    }))

    res.json(formattedProducts)
  } catch (error) {
    console.error('❌ Erro ao carregar produtos da organização:', error)
    res.status(422).send('Erro ao carregar produtos: ' + error.message)
  }
})

router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id }

  try {
    let productQuery = Product.findOne(query)

    // Se precisar de espécies (para carregar medidas dinamicamente)
    if (req.query.populate === 'specie' || req.query.populate === 'full') {
      productQuery = productQuery.populate({
        path: 'specieProduct',
        populate: {
          path: 'specie',
          select: 'scientificName popularName',
        },
      })
    } else {
      // Comportamento padrão (mantém compatibilidade)
      productQuery = productQuery.populate(populate(req))
    }

    const product = await productQuery.exec()
    return res.json(product)
  } catch (err) {
    res.sendStatus(422)
  }
})

router.post('/unique-name', auth.globalManager, async (req, res) => {
  const query = { name: req.body.name }

  if (req.body.id) {
    query._id = { $ne: req.body.id }
  }

  try {
    const found = await Product.exists(query)
    return res.json(!found)
  } catch (err) {
    res.sendStatus(422)
  }
})
router.post('/', auth.globalManager, async (req, res) => {
  try {
    const product = new Product()

    product.description = req.body.description
    product.specieProduct = req.body.specieProduct
    product.name = req.body.name
    product.bestPractices = req.body.bestPractices
    product.certifications = req.body.certifications

    await product.save()

    return res.send(product)
  } catch (err) {
    res.status(422).send('Ocorreu um erro ao incluir o produto: ' + err.message)
  }
})
// altera um produto
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    const product = await Product.findOne(query)

    if (product) {
      product.description = req.body.description
      product.specieProduct = req.body.specieProduct
      product.name = req.body.name
      product.bestPractices = req.body.bestPractices
      product.certifications = req.body.certifications

      await product.save()

      return res.send(product)
    } else {
      res.status(422).send('Produto não encontrado')
    }
  } catch (err) {
    res
      .status(422)
      .send('Ocorreu um erro ao atualizar o produto: ' + err.message)
  }
})

router.delete('/:id', auth.globalManager, (req, res) => {
  const query = { _id: req.params.id }

  Product.findOne(query).exec(function (err, product) {
    if (err) {
      res
        .status(422)
        .send('Ocorreu um erro ao excluir o produto: ' + err.message)
    } else {
      product.remove()
      res.send(product)
    }
  })
})

module.exports = router
