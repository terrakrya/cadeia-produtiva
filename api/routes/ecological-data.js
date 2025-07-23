const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const User = mongoose.model('User')
const EcologicalData = mongoose.model('EcologicalData')

router.get('/', auth.authenticated, async (req, res) => {
  const query = {}

  if (req.user.role === 'gestor') {
    const usersInOrg = await User.find({
      organization: req.user.organization,
    }).select('_id')
    const userIds = usersInOrg.map((user) => user._id)
    query.userId = { $in: userIds }
  } else if (req.user.role === 'mensageiro') {
    query.userId = req.user.id
  }

  try {
    let ecologicalQuery = EcologicalData.find(query).populate({
      path: 'userId',
      select: 'name organization',
      populate: {
        path: 'organization',
        select: 'name sigla',
      },
    })

    const ecologicalData = await ecologicalQuery.sort('-createdAt').exec()
    res.json(ecologicalData)
  } catch (err) {
    res
      .status(422)
      .send(
        `Ocorreu um erro ao carregar a lista de dados ecológicos: ${err.message}`
      )
  }
})

// Recupera todos os dados ecológicos de um usuário específico
router.get('/user/:userId', auth.authenticated, async (req, res) => {
  try {
    const ecologicalData = await EcologicalData.find({
      userId: req.params.userId,
    })

    res.json(ecologicalData)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Cria um novo registro de dados ecológicos
router.post('/', auth.authenticated, async (req, res) => {
  try {
    const {
      peakBloomMonth,
      rainySeasonStartMonth,
      nextHarvestExpectation,
      harvestStartYear,
      harvestEndYear,
      harvestStartMonth,
      harvestEndMonth,
      region,
      regionId,
    } = req.body

    const ecologicalData = new EcologicalData({
      userId: req.user.id,
      region,
      regionId,
      peakBloomMonth,
      rainySeasonStartMonth,
      nextHarvestExpectation,
      harvestStartYear,
      harvestEndYear,
      harvestStartMonth,
      harvestEndMonth,
    })

    await ecologicalData.save()
    res.status(201).json(ecologicalData)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Atualiza um registro de dados ecológicos específico
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const {
      peakBloomMonth,
      rainySeasonStartMonth,
      nextHarvestExpectation,
      harvestStartYear,
      harvestEndYear,
      harvestStartMonth,
      harvestEndMonth,
    } = req.body

    const ecologicalData = await EcologicalData.findById(req.params.id)
    if (!ecologicalData) {
      return res.status(404).json({ message: 'Dado ecológico não encontrado.' })
    }

    // Atualiza os campos conforme necessário
    ecologicalData.peakBloomMonth =
      peakBloomMonth ?? ecologicalData.peakBloomMonth
    ecologicalData.rainySeasonStartMonth =
      rainySeasonStartMonth ?? ecologicalData.rainySeasonStartMonth
    ecologicalData.nextHarvestExpectation =
      nextHarvestExpectation ?? ecologicalData.nextHarvestExpectation
    ecologicalData.harvestStartYear =
      harvestStartYear ?? ecologicalData.harvestStartYear
    ecologicalData.harvestEndYear =
      harvestEndYear ?? ecologicalData.harvestEndYear
    ecologicalData.harvestStartMonth =
      harvestStartMonth ?? ecologicalData.harvestStartMonth
    ecologicalData.harvestEndMonth =
      harvestEndMonth ?? ecologicalData.harvestEndMonth

    await ecologicalData.save()
    res.json(ecologicalData)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Deleta um registro de dados ecológicos específico
router.delete('/:id', auth.authenticated, async (req, res) => {
  try {
    const ecologicalData = await EcologicalData.findByIdAndDelete(req.params.id)
    if (!ecologicalData) {
      return res.status(404).json({ message: 'Dado ecológico não encontrado.' })
    }
    res.json({ message: 'Dado ecológico deletado com sucesso.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
