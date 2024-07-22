import GeoServer from '../geoserver'
const router = require('express').Router()
const geoServer = new GeoServer()

router.post('/upload', async (req, res) => {
  try {
    const result = await geoServer.upload(req.body.name, req.body.file)
    res.send(result)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post('/download', async (req, res) => {
  try {
    const result = await geoServer.download(req.body.layerName)
    res.send({ url: result })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post('/create', async (req, res) => {
  try {
    const result = await geoServer.create(
      req.body.coordinates,
      req.body.fileName
    )
    res.send(result)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

/**
 * Metodo responsavel por retornar um layer pelo geoserver
 * @param string $name - nome que representa o layer no geoserver
 * @return json
 */
router.get('/layer/:name', async (req, res) => {
  const geoJson = await geoServer.getLayer({ layerName: req.params.name })
  res.json(geoJson)
})

/**
 * Metodo responsavel por retornar um layer pelo geoserver
 * @param string $name - nome que representa o layer no geoserver
 * @param string $polygon - dados geoespaciais de um poligono
 * @return json
 */
router.get('/layer-intersects/:name/:polygon/:bbox', async (req, res) => {
  const geoJson = await geoServer.getLayerIntersects({
    layerName: req.params.name,
    polygon: req.params.polygon,
    bbox: req.params.bbox,
  })
  res.json(geoJson)
})

module.exports = router
