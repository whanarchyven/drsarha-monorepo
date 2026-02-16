interface Params {
  // Стандартный размер шрифта в пикселях, который задан для тега html, для удобства это обычно 10px. По умолчанию 10px
  defaultFontSize?: number;
  // Значение ширины экрана в котором масштаб будет 100%, как в макете
  startScaleWidth: number;
  // Значение ширины экрана до которого масштабирование будет увеличиваться
  endScaleTopWidth: number;
  // Значение ширины экрана до которого масштабирование будет уменьшаться
  endScaleBottomWidth: number;
}

export const remResize = ({
  defaultFontSize = 10,
  startScaleWidth,
  endScaleTopWidth,
  endScaleBottomWidth,
}: Params) => {
  const windowWidth = document.documentElement.clientWidth;

  const htmlEl = document.querySelector('html');

  if (windowWidth > endScaleTopWidth && htmlEl) {
    const diff = startScaleWidth - endScaleTopWidth;
    const percent = diff / (startScaleWidth / 100) / 100;
    htmlEl.style.fontSize = defaultFontSize - defaultFontSize * percent + 'px';
  } else if (windowWidth > startScaleWidth && htmlEl) {
    const diff = startScaleWidth - windowWidth;
    const percent = diff / (startScaleWidth / 100) / 100;
    htmlEl.style.fontSize = defaultFontSize - defaultFontSize * percent + 'px';
  } else if (
    windowWidth < startScaleWidth &&
    windowWidth >= endScaleBottomWidth &&
    htmlEl
  ) {
    const diff = startScaleWidth - windowWidth;
    const percent = diff / (startScaleWidth / 100) / 100;
    htmlEl.style.fontSize = defaultFontSize - defaultFontSize * percent + 'px';
  } else if (htmlEl) {
    htmlEl.style.fontSize = defaultFontSize + 'px';
  }
};
