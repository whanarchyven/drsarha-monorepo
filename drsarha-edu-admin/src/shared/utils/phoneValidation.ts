export const phoneValidation: any = (value: string) => {
  const re = new RegExp('^\\+7\\s\\(\\d{3}\\)\\s\\d{3}\\-\\d{2}\\-\\d{2}$');

  return re.test(value);
};

export const phoneValidationEmpty: any = (value: string) => {
  if (!value || value === `+7 (___) ___-__-__`) {
    return false;
  } else {
    return value;
  }
};
