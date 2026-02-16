const currencyFormatterWithFloat = (hideCurrencySymbol?: boolean) =>
  new Intl.NumberFormat('ru', {
    style: hideCurrencySymbol ? undefined : 'currency',
    currency: 'RUB',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const currencyFormatterWithoutFloat = (hideCurrencySymbol?: boolean) =>
  new Intl.NumberFormat('ru', {
    style: hideCurrencySymbol ? undefined : 'currency',
    currency: 'RUB',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const formatCurrency = (
  currency: string | number,
  hideCurrencySymbol?: boolean
) => {
  const str: string | string[] = String(currency).split('.');
  let result: string;

  if (str[1] && str[1].length > 2) {
    str[1] = `${str[1][0]}${str[1][1]}`;
  }

  if ((str[1] && str[1] === '00') || !str[1]) {
    result = currencyFormatterWithoutFloat(hideCurrencySymbol).format(
      Number.parseFloat(str[0])
    );
  } else {
    result = currencyFormatterWithFloat(hideCurrencySymbol).format(
      Number.parseFloat(`${str[0]}.${str[1]}`)
    );
  }

  return result.replace(',', '.');
};

export const formattedNumber = (num: number): string => {
  const str = num.toString();
  const parts: any = [];

  for (let i = str.length - 3; i >= 0; i -= 3) {
    parts.unshift(str.slice(i, i + 3));
  }

  const remainder = str.length % 3;
  if (remainder !== 0) {
    parts.unshift(str.slice(0, remainder));
  }

  return parts.join(' ');
};

export const normalizePhone = (phone: string) => {
  return `+${phone.replace(/\s|\(|\)|-|\+/g, '')}`;
};
