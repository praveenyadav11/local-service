const AppError = require('./AppError');

const normalizePhone = (value) => {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') throw new AppError('Invalid phone number', 400);

  let d = value.replace(/[\s()-]/g, '');
  if (/^\+91\d{10}$/.test(d)) d = d.slice(3);
  else if (/^91\d{10}$/.test(d)) d = d.slice(2);
  else if (/^0\d{10}$/.test(d)) d = d.slice(1);

  if (!/^[6-9]\d{9}$/.test(d)) throw new AppError('Enter a valid 10-digit mobile number', 400);
  return d;
};

module.exports = normalizePhone;