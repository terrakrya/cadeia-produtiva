function getModa(arr) {
    const frequency = {};
    let maxFreq = 0;
    let moda = [];
  
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxFreq) {
        maxFreq = frequency[item];
        moda = [item];
      } else if (frequency[item] === maxFreq) {
        moda.push(item);
      }
    });
  
    return moda[0];
  }
  
  module.exports = getModa;
  