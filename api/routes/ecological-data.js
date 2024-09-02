const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const User = mongoose.model('User')
const EcologicalDataSchema = mongoose.model('EcologicalData')

// Recupera todos os dados ecológicos de um usuário específico
router.get('/:userId', auth.authenticated, async (req, res) => {
  try {
    const ecologicalData = await EcologicalDataSchema.find({
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
    const ecologicalData = new EcologicalDataSchema({
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

    const ecologicalData = await EcologicalDataSchema.findById(req.params.id)
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
    const ecologicalData = await EcologicalDataSchema.findByIdAndDelete(
      req.params.id
    )
    if (!ecologicalData) {
      return res.status(404).json({ message: 'Dado ecológico não encontrado.' })
    }
    res.json({ message: 'Dado ecológico deletado com sucesso.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
