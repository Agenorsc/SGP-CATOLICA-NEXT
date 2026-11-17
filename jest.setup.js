import '@testing-library/jest-dom';

// Polyfills para ambiente jsdom em testes frontend do React
if (typeof window !== 'undefined') {
  window.print = jest.fn();
  window.scrollTo = jest.fn();
  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);

  if (typeof HTMLMediaElement !== 'undefined') {
    HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = jest.fn();
  }
}

if (typeof navigator !== 'undefined') {
  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {},
      writable: true,
      configurable: true
    });
  }
  navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || jest.fn().mockResolvedValue({
    getTracks: () => []
  });
  navigator.mediaDevices.enumerateDevices = navigator.mediaDevices.enumerateDevices || jest.fn().mockResolvedValue([]);
}

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
