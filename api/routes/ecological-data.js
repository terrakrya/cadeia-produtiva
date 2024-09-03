const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const User = mongoose.model('User')
const EcologicalData = mongoose.model('EcologicalData')

// Recupera todos os dados ecológicos de um usuário específico
router.get('/user/:userId', auth.authenticated, async (req, res) => {
  try {
    const ecologicalData = await EcologicalData.find({
      userId: req.params.userId,
    })
    if (!ecologicalData.length) {
      return res.status(404).json({
        message: 'Nenhum dado ecológico encontrado para este usuário.',
      })
    }
    res.json(ecologicalData)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Recupera todos os dados ecológicos de um registro específico
router.get('/:id', auth.authenticated, async (req, res) => {
  try {
    const ecologicalData = await EcologicalData.findById(req.params.id)
    if (!ecologicalData) {
      return res.status(404).json({
        message: 'Nenhum dado ecológico encontrado para este ID.',
      })
    }
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
      harvestStartMonth,
      harvestEndMonth,
    } = req.body

    // Obtém o usuário autenticado
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado.' })
    }
    // Cria o registro de dados ecológicos com a região do usuário autenticado
    const ecologicalData = new EcologicalData({
      userId: req.user.id,
      region: user.region,
      peakBloomMonth,
      rainySeasonStartMonth,
      nextHarvestExpectation,
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
router.delete('/:id', auth.manager, async (req, res) => {
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
