const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../config/auth');
const Measurement = mongoose.model('Measurement');

// Helper function to capitalize each word
function capitalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .split(' ')
    .filter(word => word.length > 0) // Remove empty words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Create a new measurement for a specific species
router.post('/', auth.globalManager, async (req, res) => {
  try {
    const { name, specie, referenceInKg } = req.body;
    
    // Validate name
    if (!name || !name.trim()) {
      return res.status(422).send('O nome da unidade é obrigatório.');
    }
    
    // Validate referenceInKg
    if (!referenceInKg || referenceInKg <= 0) {
      return res.status(422).send('A referência em Kg deve ser maior que zero.');
    }
    
    // Capitalize the name for standardization
    const capitalizedName = capitalizeName(name);
    console.log('Capitalized name:', capitalizedName);
    
    // Check if a measurement with the same name already exists for this species
    const existingMeasurement = await Measurement.findOne({ 
      name: capitalizedName, 
      specie: specie 
    });
    
    console.log('Existing measurement found:', existingMeasurement);
    
    if (existingMeasurement) {
      return res.status(422).send(`Já existe uma unidade de medida "${capitalizedName}" para esta espécie. Escolha um nome diferente.`);
    }
    
    const measurement = new Measurement({
      ...req.body,
      name: capitalizedName,
      referenceInKg: parseFloat(referenceInKg)
    });
    
    console.log('Measurement before save:', measurement);
    
    await measurement.save();
    
    console.log('Measurement after save:', measurement);
    console.log('=== END DEBUG ===');
    
    res.status(201).json(measurement);
  } catch (err) {
    console.error('Error in measurement creation:', err);
    res.status(422).send('Erro ao criar unidade de medida: ' + err.message);
  }
});

// Get all measurements for a specific species
router.get('/species/:specieId', auth.globalManager, async (req, res) => {
  try {
    const measurements = await Measurement.find({ specie: req.params.specieId });
    res.json(measurements);
  } catch (err) {
    res.status(422).send('Erro ao buscar unidades de medida: ' + err.message);
  }
});

// Get a specific measurement by ID
router.get('/:id', auth.globalManager, async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);
    if (!measurement) {
      return res.status(404).json({ error: 'Unidade de medida não encontrada' });
    }
    res.json(measurement);
  } catch (err) {
    res.status(422).send('Erro ao buscar unidade de medida: ' + err.message);
  }
});

// Update a measurement
router.put('/:id', auth.globalManager, async (req, res) => {
  try {
    const { name, specie, referenceInKg } = req.body;
    const measurementId = req.params.id;
    
    console.log('=== MEASUREMENT UPDATE DEBUG ===');
    console.log('Original name:', name);
    console.log('Original specie:', specie);
    console.log('Original referenceInKg:', referenceInKg);
    console.log('Measurement ID:', measurementId);
    
    // Validate name
    if (!name || !name.trim()) {
      return res.status(422).send('O nome da unidade é obrigatório.');
    }
    
    // Validate referenceInKg
    if (!referenceInKg || referenceInKg <= 0) {
      return res.status(422).send('A referência em Kg deve ser maior que zero.');
    }
    
    // Capitalize the name for standardization
    const capitalizedName = capitalizeName(name);
    console.log('Capitalized name:', capitalizedName);
    
    // Check if a measurement with the same name already exists for this species (excluding the current one)
    const existingMeasurement = await Measurement.findOne({ 
      name: capitalizedName, 
      specie: specie,
      _id: { $ne: measurementId }
    });
    
    console.log('Existing measurement found:', existingMeasurement);
    
    if (existingMeasurement) {
      return res.status(422).send(`Já existe uma unidade de medida "${capitalizedName}" para esta espécie. Escolha um nome diferente.`);
    }
    
    console.log('Update data:', {
      ...req.body,
      name: capitalizedName,
      referenceInKg: parseFloat(referenceInKg)
    });
    
    const measurement = await Measurement.findByIdAndUpdate(measurementId, {
      ...req.body,
      name: capitalizedName,
      referenceInKg: parseFloat(referenceInKg)
    }, { new: true });
    
    console.log('Updated measurement:', measurement);
    console.log('=== END UPDATE DEBUG ===');
    
    if (!measurement) {
      return res.status(404).json({ error: 'Unidade de medida não encontrada' });
    }
    res.json(measurement);
  } catch (err) {
    console.error('Error in measurement update:', err);
    res.status(422).send('Erro ao atualizar unidade de medida: ' + err.message);
  }
});

// Delete a measurement
router.delete('/:id', auth.globalManager, async (req, res) => {
  try {
    const measurement = await Measurement.findByIdAndDelete(req.params.id);
    if (!measurement) {
      return res.status(404).json({ error: 'Unidade de medida não encontrada' });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(422).send('Erro ao excluir unidade de medida: ' + err.message);
  }
});

module.exports = router;
