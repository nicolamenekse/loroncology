import React from 'react';
import { TextField, Typography, Box } from '@mui/material';
import { isValueInRange, getReferenceRangeText } from '../config/referenceRanges';

const ParameterInput = ({ 
  parameter, 
  parameterType, 
  value, 
  onChange, 
  label, 
  size = 'small',
  ...props 
}) => {
  const isInRange = isValueInRange(value, parameter, parameterType);
  const referenceRange = getReferenceRangeText(parameter, parameterType);
  
  // Renk belirleme
  let color = 'primary';
  let helperTextColor = 'text.secondary';
  
  if (isInRange === false) {
    color = 'error';
    helperTextColor = 'error.main';
  } else if (isInRange === true) {
    color = 'success';
    helperTextColor = 'success.main';
  }

  return (
    <Box>
      <TextField
        fullWidth
        label={label || parameter}
        name={parameter}
        value={value || ''}
        onChange={onChange}
        variant="outlined"
        size={size}
        color={color}
        type="number"
        inputProps={{ 
          step: "any",
          min: 0 
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isInRange === false ? 'error.main' : undefined,
              borderWidth: isInRange === false ? 2 : 1,
            },
            '&:hover fieldset': {
              borderColor: isInRange === false ? 'error.main' : undefined,
            },
            '&.Mui-focused fieldset': {
              borderColor: isInRange === false ? 'error.main' : undefined,
            },
          },
          '& .MuiInputLabel-root': {
            color: isInRange === false ? 'error.main' : undefined,
            '&.Mui-focused': {
              color: isInRange === false ? 'error.main' : undefined,
            },
          },
        }}
        {...props}
      />
      {referenceRange && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: helperTextColor,
            fontSize: '0.7rem',
            fontWeight: isInRange === false ? 600 : 400,
            display: 'block',
            mt: 0.5
          }}
        >
          Referans: {referenceRange}
        </Typography>
      )}
    </Box>
  );
};

export default ParameterInput; 