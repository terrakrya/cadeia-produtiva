const Decimal = require('decimal.js')
const getModa = require('./moda')
const convertUnit = require('./convertUnit')

// Função para processar os preços e calcular o resumo por região (squares)
function processSquares(prices, unitOfMeasurement) {
  const squares = new Map()

  prices.forEach((price) => {
    const minimumPrice = convertUnit(price.minimumPrice, unitOfMeasurement)
    const maximumPrice = convertUnit(price.maximumPrice, unitOfMeasurement)

    const squareName = price.region

    if (!squares.has(squareName)) {
      squares.set(squareName, {
        minimumPrice: minimumPrice,
        maximumPrice: maximumPrice,
        totalPrice: new Decimal(minimumPrice).plus(maximumPrice),
        count: 1,
        priceValues: [minimumPrice, maximumPrice],
      })
    } else {
      const square = squares.get(squareName)
      square.minimumPrice = Math.min(square.minimumPrice, minimumPrice)
      square.maximumPrice = Math.max(square.maximumPrice, maximumPrice)
      square.totalPrice = square.totalPrice
        .plus(minimumPrice)
        .plus(maximumPrice)
      square.count += 1
      square.priceValues.push(minimumPrice, maximumPrice)
    }
  })

  // Processar os quadrantes para calcular preços médios e moda
  const squaresArray = Array.from(squares.keys()).map((key) => {
    const square = squares.get(key)
    const averagePrice = square.totalPrice.div(square.count * 2).toNumber()

    return {
      name: key,
      minimumPrice: square.minimumPrice,
      maximumPrice: square.maximumPrice,
      averagePrice,
      moda: getModa(square.priceValues),
      totalPrices: square.count,
    }
  })

  // Ordenar os quadrantes se necessário
  squaresArray.sort((a, b) => b.averagePrice - a.averagePrice)

  return squaresArray
}

module.exports = {
  processSquares,
}
