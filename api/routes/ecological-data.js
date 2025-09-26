const mongoose = require('mongoose')
const router = require('express').Router()
const auth = require('../config/auth')
const User = mongoose.model('User')
const EcologicalData = mongoose.model('EcologicalData')

// Função para verificar se o usuário tem permissão para acessar/modificar dados ecológicos
async function hasPermissionToAccessEcologicalData(req, ecologicalDataUserId) {
  const userRole = req.user.role
  const userId = req.user.id
  const userOrg = req.user.organization

  // Admin e gestor-global podem acessar qualquer dado
  if (userRole === 'admin' || userRole === 'gestor-global') {
    return true
  }

  // Gestor pode acessar dados de usuários da sua organização
  if (userRole === 'gestor') {
    const targetUser = await User.findById(ecologicalDataUserId).select('organization')
    return targetUser && targetUser.organization.toString() === userOrg.toString()
  }

  // Mensageiro só pode acessar seus próprios dados
  if (userRole === 'mensageiro') {
    return ecologicalDataUserId.toString() === userId.toString()
  }

  return false
}

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
    // Verifica se o usuário tem permissão para acessar os dados do usuário especificado
    const hasPermission = await hasPermissionToAccessEcologicalData(req, req.params.userId)
    if (!hasPermission) {
      return res.status(403).json({
        message: 'Você não tem permissão para acessar os dados ecológicos deste usuário.'
      })
    }

    const ecologicalData = await EcologicalData.find({
      userId: req.params.userId,
    })

    res.json(ecologicalData)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Recupera um registro de dados ecológicos específico por ID
router.get('/:id', auth.authenticated, async (req, res) => {
  try {
    const ecologicalData = await EcologicalData.findById(req.params.id)
    if (!ecologicalData) {
      return res.status(404).json({ message: 'Dado ecológico não encontrado.' })
    }

    // Verifica se o usuário tem permissão para acessar este dado
    const hasPermission = await hasPermissionToAccessEcologicalData(req, ecologicalData.userId)
    if (!hasPermission) {
      return res.status(403).json({
        message: 'Você não tem permissão para acessar este dado ecológico.'
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

    // Verifica se o usuário tem permissão para editar este dado
    const hasPermission = await hasPermissionToAccessEcologicalData(req, ecologicalData.userId)
    if (!hasPermission) {
      return res.status(403).json({
        message: 'Você não tem permissão para editar este dado ecológico.'
      })
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
    const ecologicalData = await EcologicalData.findById(req.params.id)
    if (!ecologicalData) {
      return res.status(404).json({ message: 'Dado ecológico não encontrado.' })
    }

    // Verifica se o usuário tem permissão para deletar este dado
    const hasPermission = await hasPermissionToAccessEcologicalData(req, ecologicalData.userId)
    if (!hasPermission) {
      return res.status(403).json({
        message: 'Você não tem permissão para deletar este dado ecológico.'
      })
    }

    await EcologicalData.findByIdAndDelete(req.params.id)
    res.json({ message: 'Dado ecológico deletado com sucesso.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
