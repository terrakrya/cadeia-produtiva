const Decimal = require('decimal.js')
const getModa = require('./moda')
const convertUnit = require('./convertUnit')

// Função para inicializar o resumo
function initializeSummary(unitOfMeasurement, prices) {
  if (!prices || prices.length === 0) {
    return {
      minimumPrice: null,
      maximumPrice: null,
      averagePrice: null,
      moda: null,
      squares: {},
      totalPrices: 0,
    }
  }

  return {
    minimumPrice: convertUnit(prices[0].minimumPrice, unitOfMeasurement),
    maximumPrice: convertUnit(prices[0].maximumPrice, unitOfMeasurement),
    averagePrice: 0,
    moda: 0,
    squares: {},
    totalPrices: prices.length,
  }
}

// Função para processar os preços e calcular o summary
function processPrices(prices, unitOfMeasurement) {
  const priceValues = []
  const squares = new Map()
  let summary = initializeSummary(unitOfMeasurement, prices)

  prices.forEach((price) => {
    const minimumPrice = convertUnit(price.minimumPrice, unitOfMeasurement)
    const maximumPrice = convertUnit(price.maximumPrice, unitOfMeasurement)

    priceValues.push(minimumPrice)
    priceValues.push(maximumPrice)

    if (summary.minimumPrice > minimumPrice) {
      summary.minimumPrice = minimumPrice
    }

    if (summary.maximumPrice < maximumPrice) {
      summary.maximumPrice = maximumPrice
    }

    const squareName = price.region

    if (!squares.has(squareName)) {
      squares.set(squareName, {
        minimumPrice: minimumPrice,
        maximumPrice: maximumPrice,
        totalPrice: new Decimal(minimumPrice).plus(maximumPrice),
        count: 1,
      })
    } else {
      const square = squares.get(squareName)
      square.minimumPrice = Math.min(square.minimumPrice, minimumPrice)
      square.maximumPrice = Math.max(square.maximumPrice, maximumPrice)
      square.totalPrice = square.totalPrice
        .plus(minimumPrice)
        .plus(maximumPrice)
      square.count += 1
    }
  })

  summary.moda = getModa(priceValues)

  // Process squares to calculate average prices and percent
  summary = calculateSquaresSummary(summary, squares)

  return summary
}

// Função para calcular o resumo dos quadrantes
function calculateSquaresSummary(summary, squares) {
  summary.minimumAveragePrice = 0
  summary.maximumAveragePrice = 0

  summary.squares = Array.from(squares.keys()).map((key) => {
    const square = squares.get(key)
    const averagePrice = square.totalPrice.div(square.count * 2).toNumber()

    if (
      summary.minimumAveragePrice === 0 ||
      summary.minimumAveragePrice > averagePrice
    ) {
      summary.minimumAveragePrice = averagePrice
    }

    if (
      summary.maximumAveragePrice === 0 ||
      summary.maximumAveragePrice < averagePrice
    ) {
      summary.maximumAveragePrice = averagePrice
    }

    return {
      name: key,
      minimumPrice: square.minimumPrice,
      maximumPrice: square.maximumPrice,
      averagePrice,
    }
  })

  summary.squares = summary.squares.sort(
    (a, b) => b.averagePrice - a.averagePrice
  )

  summary.squares = summary.squares.map((square) => ({
    ...square,
    percentAveragePrice: new Decimal(square.averagePrice)
      .times(100)
      .div(summary.maximumAveragePrice)
      .toNumber(),
  }))

  summary.averagePrice = new Decimal(
    summary.squares.reduce((a, b) => new Decimal(a).plus(b.averagePrice), 0)
  )
    .div(summary.squares.length)
    .toNumber()

  return summary
}

module.exports = {
  initializeSummary,
  processPrices,
  calculateSquaresSummary,
}
