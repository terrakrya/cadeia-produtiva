/* eslint-disable */
import { readFileSync, writeFileSync } from 'fs'
import { get as _get, put } from 'axios'
import slugify from 'slugify'
import { basename } from 'path'
import { zip as _zip } from 'shp-write'
import admZip from 'adm-zip'

class GeoServer {
  /*
    Metodo responsavel por retornar um layer no formato GeoJson do servidor GeoServer
    @param object layer - Dados persistido no layer
    @return object
  */
  async getLayer(layer, polygon) {
    const url = `${process.env.GEOSERVER_URL}/${process.env.GEOSERVER_WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${process.env.GEOSERVER_WORKSPACE}%3A${layer.layerName}&maxFeatures=50&outputFormat=application%2Fjson`
    return this.get(url)
  }

  /*
    Metodo responsavel por retornar um layer com uma intersecção entre um poligono
    no formato GeoJson do servidor GeoServer
    @param object layer - Dados persistido no layer
    @return object
  */
  async getLayerIntersects(layer) {
    // Monta a URL
    const url = `${process.env.GEOSERVER_URL}/${process.env.GEOSERVER_WORKSPACE}/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=${process.env.GEOSERVER_WORKSPACE}:${layer.layerName}&OUTPUTFORMAT=application/json&CQL_FILTER=BBOX(the_geom,${layer.bbox})&SRSNAME=EPSG:4674`
    console.log(url)
    return this.get(url)
  }

  /*
    Metodo responsavel por montar a requisição GET a api do geoserver
    @param string $url - URL para buscar o Layer no geo Server
    @return object
  */
  async get(url) {
    try {
      const response = await _get(url, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.GEOSERVER_USER}:${process.env.GEOSERVER_PASS}`
          ).toString('base64')}`,
        },
      })
      console.log('##### url:', url)
      if (response.status >= 200 && response.status < 300) {
        return response.data
      } else {
        return `Failed to get layer. Status: ${response.status}.`
      }
    } catch (error) {
      return `Failed to get layer. ${error.message}`
    }
  }

  /*
    Metodo responsavel por upar um shapefile para o servidor de geo
    @param string dataStore - Nome do Data Store dentro do geoserver
    @param string filePath - Caminho do arquivo dentro do servidor local
    @return object
  */
  async upload(dataStore, filePath) {
    // Seta o nome padrao para o datastore a ser criada no geoserver
    let datastoreName = slugify(dataStore, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    })
    datastoreName = 'upload-' + datastoreName

    // Caminho para o arquivo shapefile
    const shapefilePath = filePath

    // Obter e trata o nome do layer a partir do caminho completo
    const fileName = processFileName(filePath)

    // Constroi a URL para a publicação do shapefile
    const publishURL = `${process.env.GEOSERVER_URL}/rest/workspaces/${process.env.GEOSERVER_WORKSPACE}/datastores/${datastoreName}/file.shp`

    // Configurações da requisição HTTP
    const config = {
      headers: {
        'Content-Type': 'application/zip',
        Authorization: `Basic ${Buffer.from(
          `${process.env.GEOSERVER_USER}:${process.env.GEOSERVER_PASS}`
        ).toString('base64')}`,
      },
    }

    try {
      // Obtenha o conteúdo binário do shapefile
      const shapefileContent = readFileSync(shapefilePath)

      // Realize a chamada HTTP para publicar o shapefile
      const response = await put(publishURL, shapefileContent, config)

      // Verifique o status da resposta (código HTTP 2xx indica sucesso)
      if (response.status >= 200 && response.status < 300) {
        return { success: true, datastore: datastoreName, layername: fileName }
      } else {
        return {
          success: false,
          message: `Failed to upload ${response.status}`,
        }
      }
    } catch (error) {
      // Captura erros durante a execução do código acima
      return { success: false, message: error }
    }
  }

  /*
    Metodo responsavel por montar a URL que acessa o layer para download no geo server
    @param string layerName - Caminho do arquivo dentro do servidor local
    @return string
  */
  async download(layerName) {
    const url = `${process.env.GEOSERVER_URL}/${process.env.GEOSERVER_WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${process.env.GEOSERVER_WORKSPACE}%3A${layerName}&maxFeatures=50&outputFormat=SHAPE-ZIP`
    return url
  }

  /**
   * Método responsável por criar uma nova camada no Geoserver baseada em um polígono.
   * @param {Array} polygon - Array representando as coordenadas do polígono.
   * @param {string} fileName - Nome do arquivo a ser gerado e enviado ao Geoserver.
   * @return {Object} - Objeto com informações sobre o resultado da operação.
   * @property {boolean} success - Indica se a operação foi bem-sucedida.
   * @property {string} datastore - Nome do datastore associado à camada criada.
   * @property {string} layername - Nome da camada criada.
   */
  async create(polygon, fileName) {
    try {
      fileName = slugify(fileName, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      })

      const path = 'api/uploads/documents/'
      const fileTmp = path + fileName + '-tmp.zip'

      const options = {
        folder: fileName,
        filename: fileName,
        outputType: 'blob',
        compression: 'DEFLATE',
        types: {
          polygon: fileName,
        },
      }

      // 1 - Cria o arquivo fisico do Shapefile
      const shpBuffer = _zip(
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                // TODO possivelmente aqui esta o problema na geração
                // do shapefile
                coordinates: [polygon],
              },
            },
          ],
        },
        options
      )

      // 2 - Escreve o arquivo zip
      writeFileSync(fileTmp, shpBuffer)

      // 3 - Descompacta o arquivo zip
      const zip = new admZip(fileTmp)
      zip.getEntries()
      zip.extractAllTo(path, true)

      // 4 - Compacta Novamente sem o diretorio zoado para o geoserver
      const fileCreated = path + fileName + '.zip'
      zip.addLocalFolder(path + fileName)
      zip.writeZip(fileCreated)

      // 5 - Chama o metodo para upar o shapefile para o servidor
      const result = await this.upload(fileName, fileCreated)
      return {
        success: true,
        datastore: result.datastore,
        layername: result.layername,
      }
    } catch (error) {
      return { success: false, message: error }
    }
  }
}

/**
 * Função responsavel por formatar o nome do arquivo
 * @param String filePath
 * @return String
 */
function processFileName(filePath) {
  // Get filename
  fileName = basename(filePath)

  // Find the position of the first non-numeric character
  const nonNumericIndex = fileName.search(/\D/)

  // If there's a non-numeric character, extract the part of the string after it
  const partWithoutNumbers =
    nonNumericIndex >= 0 ? fileName.slice(nonNumericIndex) : fileName

  // Remove the file extension (assuming the extension is after the last dot)
  const partWithoutExtension = partWithoutNumbers.replace(/\.[^.]+$/, '')

  // Remove the leading hyphen
  const finalResult = partWithoutExtension.replace(/^-/, '')

  return finalResult
}

export default GeoServer
/* eslint-enable */
