export const hemogramParameters = {
  'WBC': { min: 5.50, max: 19.50, unit: '×10³/μL' },
  'Neu#': { min: 1.80, max: 12.60, unit: '×10³/μL' },
  'Lym#': { min: 0.80, max: 7.90, unit: '×10³/μL' },
  'Mon#': { min: 0.00, max: 1.80, unit: '×10³/μL' },
  'Eos#': { min: 0.00, max: 1.90, unit: '×10³/μL' },
  'Neu%': { min: 30.0, max: 85.0, unit: '%' },
  'Lym%': { min: 10.0, max: 53.0, unit: '%' },
  'Mon%': { min: 0.0, max: 10.0, unit: '%' },
  'Eos%': { min: 0.0, max: 11.0, unit: '%' },
  'RBC': { min: 5.10, max: 11.20, unit: '×10⁶/μL' },
  'HGB': { min: 8.5, max: 16.2, unit: 'g/dL' },
  'HCT': { min: 26.0, max: 51.0, unit: '%' },
  'MCV': { min: 35.0, max: 54.0, unit: 'fL' },
  'MCH': { min: 11.8, max: 18.0, unit: 'pg' },
  'MCHC': { min: 300, max: 380, unit: 'g/L' },
  'RDW-CV': { min: 13.2, max: 25.6, unit: '%' },
  'RDW-SD': { min: 23.7, max: 45.6, unit: 'fL' },
  'PLT': { min: 100, max: 518, unit: '×10³/μL' },
  'MPV': { min: 8.2, max: 16.3, unit: 'fL' },
  'PDW': { min: 12.0, max: 17.5, unit: 'fL' },
  'PCT': { min: 0.90, max: 7.00, unit: '%' }
};

export const biyokimyaParameters = {
  'TP': { min: 5.4, max: 8.9, unit: 'g/dL' },
  'ALB': { min: 2.2, max: 4.5, unit: 'g/dL' },
  'GLD': { min: 1.5, max: 5.7, unit: 'g/dL' },
  'A/G': { min: null, max: null, unit: 'ratio' }, // Referans aralığı yok
  'TBIL': { min: 0.1, max: 0.9, unit: 'mg/dL' },
  'ALT': { min: 8.2, max: 123, unit: 'U/L' },
  'AST': { min: 9.2, max: 60, unit: 'U/L' },
  'AST/ALT': { min: null, max: null, unit: 'ratio' }, // Referans aralığı yok
  'GGT': { min: 0.0, max: 2.0, unit: 'U/L' },
  'ALP': { min: 10, max: 90, unit: 'U/L' },
  'TBA': { min: 0, max: 15, unit: 'μmol/L' },
  'CK': { min: 50, max: 450, unit: 'U/L' },
  'AMY': { min: 400, max: 3500, unit: 'U/L' },
  'TG': { min: 0.8, max: 79.7, unit: 'mg/dL' },
  'CHOL': { min: 65, max: 225, unit: 'mg/dL' },
  'GLU': { min: 74, max: 159, unit: 'mg/dL' },
  'CRE': { min: 0.3, max: 2.5, unit: 'mg/dL' },
  'BUN': { min: 10, max: 43, unit: 'mg/dL' },
  'BUN/CRE': { min: null, max: null, unit: 'ratio' }, // Referans aralığı yok
  'tCO2': { min: 15, max: 24, unit: 'mmol/L' },
  'Ca': { min: 7.8, max: 11.8, unit: 'mg/dL' },
  'P': { min: 3.1, max: 8.5, unit: 'mg/dL' },
  'Ca*P': { min: null, max: null, unit: 'mg²/dL²' }, // Referans aralığı yok
  'Mg': { min: 1.7, max: 2.9, unit: 'mg/dL' }
};

// Değerin referans aralığında olup olmadığını kontrol eden fonksiyon
export const isValueInRange = (value, parameter, parameterType) => {
  if (!value || value === '') return null; // Boş değerler için kontrol yapmıyoruz
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null; // Geçersiz sayılar için kontrol yapmıyoruz
  
  const ranges = parameterType === 'hemogram' ? hemogramParameters : biyokimyaParameters;
  const range = ranges[parameter];
  
  if (!range || range.min === null || range.max === null) return null; // Referans aralığı yoksa kontrol yapmıyoruz
  
  return numValue >= range.min && numValue <= range.max;
};

// Parametrenin referans aralığını string olarak döndüren fonksiyon
export const getReferenceRangeText = (parameter, parameterType) => {
  const ranges = parameterType === 'hemogram' ? hemogramParameters : biyokimyaParameters;
  const range = ranges[parameter];
  
  if (!range) return '';
  if (range.min === null || range.max === null) return 'Referans aralığı yok';
  
  return `${range.min} - ${range.max} ${range.unit}`;
};

// Tüm parametrelerin listesini döndüren fonksiyon
export const getAllParameters = () => {
  return {
    hemogram: Object.keys(hemogramParameters),
    biyokimya: Object.keys(biyokimyaParameters)
  };
}; 