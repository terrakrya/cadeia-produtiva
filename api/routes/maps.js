import momentTz from 'moment-timezone'
import { model } from 'mongoose'
const router = require('express').Router()
const Map = model('Map')
const Layer = model('Layer')
const Shape = model('Shape')

/*
  Metodo responsavel por montar os layers e os shapes de um mapa
  @param int $id
  @return object
*/
const getMap = async (id) => {
  return await Map.findById(id)
    .populate({ path: 'layers' })
    .then(async (map) => {
      for (let index = 0; index < map.layers.length; index++) {
        const layer = map.layers[index]
        const seq = layer.seq_get_from_api
        const shapes = await Shape.find({
          layer: layer.id,
          seq_get_from_api: seq,
        })

        layer.shapes = layer.shapes || []
        layer.shapes.push(...shapes)
      }
      return map
    })
}

router.get('/', async (req, res) => {
  const query = {}
  const maps = await Map.find(query).then(async (maps) => {
    for (let index = 0; index < maps.length; index++) {
      const map = maps[index]
      const mapdata = await getMap(map._id)
      maps[index] = mapdata
    }
    return maps
  })

  res.json(maps)
})

router.get('/:id', async (req, res) => {
  const map = await getMap(req.params.id)
  res.json(map)
})

router.post('/', async (req, res) => {
  const newMap = new Map(req.body)
  await newMap.save()
  const map = await getMap(newMap._id)
  res.send(map)
})

router.put('/:id', async (req, res) => {
  const updateMap = Map.findById(req.params.id)
  Object.assign(updateMap, req.body)
  await updateMap.save()
  const map = await getMap(updateMap._id)
  res.send(map)
})

router.post('/layer', async (req, res) => {
  const newLayer = new Layer(req.body)
  newLayer.user = req.body.user_id
  newLayer.create_user_rule = req.body.create_user_rule
  await newLayer.save()
  const map = await getMap(newLayer.map)
  res.send(map)
})

router.put('/:id/layer', async (req, res) => {
  const layer = await Layer.findById(req.params.id)
  Object.assign(layer, req.body)
  await layer.save()
  const map = await getMap(layer.map)
  res.send(map)
})

router.delete('/:id/layer', async (req, res) => {
  const layerId = req.params.id

  try {
    const layer = await Layer.findById(layerId)

    if (!layer) {
      return res.status(404).send('Layer não encontrado')
    }

    await Shape.deleteMany({ layer: layerId })
    await Layer.findByIdAndRemove(layerId)

    res.send('Shapes excluídos com sucesso')
  } catch (err) {
    res.status(500).send('Erro ao excluir o layer')
  }
})

router.post('/:id/layer-import-geojson', async (req, res) => {
  const layer = await Layer.findById(req.params.id)

  const timeGetFromApi = momentTz(new Date())
    .tz('America/Sao_Paulo')
    .format('YYYY-MM-DD HH:mm:ss')
  if (layer) {
    const seqGetFromApi =
      layer.seq_get_from_api !== undefined ? layer.seq_get_from_api + 1 : 1
    layer.time_get_from_api = timeGetFromApi
    if (layer.seq_get_from_api !== undefined) {
      layer.seq_get_from_api = seqGetFromApi
    }

    await layer.save()
    for (const feature of req.body.features) {
      if (feature.geometry) {
        const shape = new Shape({
          layer: req.params.id,
        })
        const geojson = {}
        geojson[feature.geometry.type.toLowerCase()] = feature.geometry
        shape.geo_json = geojson
        shape.properties = feature.properties
        shape.time_get_from_api = timeGetFromApi
        shape.seq_get_from_api = seqGetFromApi

        await shape.save()
      }
    }
    const map = await getMap(layer.map)
    res.json(map)
  } else {
    res.status(422).send('Camada não encontrada')
  }
})

router.post('/shape', (req, res) => {
  const newShape = new Shape(req.body)
  newShape.save(function (err, shape) {
    if (err) {
      res.status(422).send(err.message)
    } else {
      res.send(shape)
    }
  })
})

router.put('/:id/shape', (req, res) => {
  const shape = Shape.findById(req.params.id)
  Object.assign(shape, req.body)
  shape.save(function (err, updated) {
    if (err) {
      res.status(422).send(err.message)
    } else {
      res.send(updated)
    }
  })
})

module.exports = router
