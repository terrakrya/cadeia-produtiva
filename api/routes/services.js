const mongoose = require('mongoose')
const router = require('express').Router()
const authenticateToken = require('../config/api-auth')
const User = mongoose.model('User')
const Price = mongoose.model('PriceInformation')

router.get('/user-by-phone/:cellphone', authenticateToken, async (req, res) => {
  try {
    if (!req.params.cellphone) {
      return res.status(400).json({ message: 'Número de telefone é obrigatório' })
    }

    const cleanPhone = req.params.cellphone.replace(/\D/g, '')
    const user = await User.findOne({ cellphone: cleanPhone })
      .populate('organization')
      .select('-hash -salt')

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    return res.json(user)
  } catch (err) {
    res.status(422).json({ message: 'Erro ao buscar usuário: ' + err.message })
  }
})

router.get('/prices-by-region/:region', authenticateToken, async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'messenger',
          foreignField: '_id',
          as: 'messengerDetails'
        }
      },
      {
        $unwind: {
          path: '$messengerDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          'messengerDetails.region': req.params.region
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          price: 1,
          minimumPrice: 1,
          maximumPrice: 1,
          date: '$createdAt',
          product: {
            _id: '$productDetails._id',
            name: '$productDetails.name'
          },
          messenger: '$messengerDetails._id',
          messengerDetails: {
            _id: '$messengerDetails._id',
            name: '$messengerDetails.name',
            email: '$messengerDetails.email',
            cellphone: '$messengerDetails.cellphone',
            role: '$messengerDetails.role',
            region: '$messengerDetails.region'
          }
        }
      }
    ]

    const prices = await Price.aggregate(pipeline)
    res.json(prices)
  } catch (err) {
    res.status(422).json({ message: 'Erro ao buscar preços: ' + err.message })
  }
})

module.exports = router
