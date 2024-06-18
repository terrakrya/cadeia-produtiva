const Decimal = require('decimal.js');
const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../config/auth');
const populate = require('../config/utils').populate;
const moment = require('moment');
const convertUnit = require('../utils/convertUnit');
const getModa = require('../utils/moda');

moment.locale('pt-br');
const Price = mongoose.model('PriceInformation');

// Helper function for building query filters
const buildFilters = (filters) => {
  const query = {};

  if (filters.product) query.product = filters.product;
  if (filters.regions) query.region = filters.regions;
  if (filters.buyerPosition) query.buyerPositionBuyer = filters.buyerPosition;
  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) query.createdAt.$gte = new Date(filters.from);
    if (filters.to) query.createdAt.$lte = new Date(filters.to);
  }

  return query;
};

// Route for getting price information
router.get('/', auth.authenticated, async (req, res) => {
  const query = {};

  if (req.user.role === 'gestor') {
    query.organization = req.user.organization;
  } else if (req.user.role === 'mensageiro') {
    query.messenger = req.user.id;
  }

  try {
    const price = await Price.find(query)
      .populate('product')
      .populate('messenger')
      .populate('organization')
      .sort('price');
    res.json(price);
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao carregar a lista de preço: ${err.message}`);
  }
});

// Route for getting harvest mode data
router.get('/harvest-mode', auth.authenticated, async (req, res) => {
  try {
    const query = buildFilters(req.query);
    const prices = await Price.find(query).sort({ createdAt: 1 });

    if (!prices.length) return res.json([]);

    const modaWeekly = {};

    prices.forEach((price) => {
      const startOfMonth = moment(price.createdAt).startOf('month');
      const weekOfMonth = Math.ceil(moment(price.createdAt).diff(startOfMonth, 'days') / 7) + 1;
      const formattedWeek = `${moment(price.createdAt).format('MMM/YY').toUpperCase()} - Semana ${weekOfMonth}`;

      if (!modaWeekly[formattedWeek]) modaWeekly[formattedWeek] = [];
      modaWeekly[formattedWeek].push(
        convertUnit(price.minimumPrice, req.query.unitOfMeasurement),
        convertUnit(price.maximumPrice, req.query.unitOfMeasurement)
      );
    });

    const modaByWeek = Object.keys(modaWeekly).map((week) => ({
      week,
      moda: getModa(modaWeekly[week]),
    }));

    res.json(modaByWeek);
  } catch (err) {
    console.error('Erro ao carregar a lista de preço:', err);
    res.status(500).send(`Ocorreu um erro ao carregar a lista de preço: ${err.message}`);
  }
});

// Route for getting summary data
router.get('/summary', auth.authenticated, async (req, res) => {
  const query = buildFilters(req.query);
  const prices = await Price.find(query);

  let summary = {
    minimumPrice: null,
    maximumPrice: null,
    averagePrice: null,
    moda: null,
    squares: {},
    totalPrices: 0,
  };

  if (prices && prices.length) {
    summary = {
      minimumPrice: convertUnit(prices[0].minimumPrice, req.query.unitOfMeasurement),
      maximumPrice: convertUnit(prices[0].maximumPrice, req.query.unitOfMeasurement),
      averagePrice: 0,
      moda: 0,
      squares: {},
      totalPrices: prices.length,
    };

    const priceValues = [];

    prices.forEach((price) => {
      const minimumPrice = convertUnit(price.minimumPrice, req.query.unitOfMeasurement);
      const maximumPrice = convertUnit(price.maximumPrice, req.query.unitOfMeasurement);

      priceValues.push(minimumPrice);
      priceValues.push(maximumPrice);

      if (summary.minimumPrice > minimumPrice) {
        summary.minimumPrice = minimumPrice;
      }

      if (summary.maximumPrice < maximumPrice) {
        summary.maximumPrice = maximumPrice;
      }

      const squareName = price.region;

      if (!summary.squares[squareName]) {
        summary.squares[squareName] = {
          minimumPrice: minimumPrice,
          maximumPrice: maximumPrice,
          averagePrices: [new Decimal(minimumPrice).plus(maximumPrice).div(2)],
        };
      } else {
        summary.squares[squareName].minimumPrice =
          summary.squares[squareName].minimumPrice < minimumPrice
            ? summary.squares[squareName].minimumPrice
            : minimumPrice;
        summary.squares[squareName].maximumPrice =
          summary.squares[squareName].maximumPrice > maximumPrice
            ? summary.squares[squareName].maximumPrice
            : maximumPrice;
        summary.squares[squareName].averagePrices.push(
          new Decimal(minimumPrice).plus(maximumPrice).div(2)
        );
      }
    });

    summary.moda = getModa(priceValues);

    summary.minimumAveragePrice = 0;
    summary.maximumAveragePrice = 0;
    summary.squares = Object.keys(summary.squares).map((key) => {
      const square = summary.squares[key];

      const averagePrice = new Decimal(
        square.averagePrices.reduce((a, b) => new Decimal(a).plus(b), 0)
      )
        .div(square.averagePrices.length)
        .toNumber();

      if (
        summary.minimumAveragePrice === 0 ||
        summary.minimumAveragePrice > averagePrice
      ) {
        summary.minimumAveragePrice = averagePrice;
      }

      if (
        summary.maximumAveragePrice === 0 ||
        summary.maximumAveragePrice < averagePrice
      ) {
        summary.maximumAveragePrice = averagePrice;
      }

      return {
        name: key,
        minimumPrice: square.minimumPrice,
        maximumPrice: square.maximumPrice,
        averagePrice,
      };
    });

    summary.squares = summary.squares.sort((a, b) => {
      if (a.averagePrice > b.averagePrice) {
        return -1;
      }
      if (a.averagePrice < b.averagePrice) {
        return 1;
      }
      return 0;
    });

    summary.squares = summary.squares.map((square) => {
      return {
        ...square,
        percentAveragePrice: new Decimal(square.averagePrice)
          .times(100)
          .div(summary.maximumAveragePrice)
          .toNumber(),
      };
    });

    summary.averagePrice = new Decimal(
      summary.squares.reduce((a, b) => new Decimal(a).plus(b.averagePrice), 0)
    )
      .div(summary.squares.length)
      .toNumber();
  }

  res.json(summary);
});

// Route for getting data published
router.get('/data-published', auth.authenticated, async (req, res) => {
  const query = buildFilters(JSON.parse(req.query.filters || '{}'));

  try {
    const priceListAgr = await Price.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%d/%m/%Y', date: '$createdAt' } },
            from: '$buyerPositionSeller',
            to: '$buyerPositionBuyer',
          },
          minimumPrice: { $min: '$minimumPrice' },
          maximumPrice: { $max: '$maximumPrice' },
        },
      },
    ]);

    const priceList = priceListAgr.map((obj) => ({
      date: obj._id.date,
      from: obj._id.from,
      to: obj._id.to,
      minimumPrice: obj.minimumPrice,
      maximumPrice: obj.maximumPrice,
      averagePrice: (obj.minimumPrice + obj.maximumPrice) / 2,
    }));

    res.json(priceList);
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao carregar a lista de preço: ${err.message}`);
  }
});

// Route for getting price by id
router.get('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id };

  try {
    const price = await Price.findOne(query).populate(populate(req));
    return res.json(price);
  } catch (err) {
    res.sendStatus(422);
  }
});

// Route for creating new price
router.post('/', auth.authenticated, async (req, res) => {
  try {
    const price = new Price();

    Object.assign(price, req.body);

    await price.save();

    return res.send(price);
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao incluir o preço: ${err.message}`);
  }
});

// Route for updating price by id
router.put('/:id', auth.authenticated, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    const price = await Price.findOne(query);

    if (price) {
      Object.assign(price, req.body);

      await price.save();

      return res.send(price);
    } else {
      res.status(422).send('Preço não encontrado');
    }
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao atualizar o preço: ${err.message}`);
  }
});

// Route for deleting price by id
router.delete('/:id', auth.authenticated, async (req, res) => {
  const query = { _id: req.params.id };

  try {
    const price = await Price.findOne(query);
    if (price) {
      await price.remove();
      res.send(price);
    } else {
      res.status(422).send('Preço não encontrado');
    }
  } catch (err) {
    res.status(422).send(`Ocorreu um erro ao excluir o preço: ${err.message}`);
  }
});

module.exports = router;
