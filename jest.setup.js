// Jest環境の拡張・カスタマイズを行うファイル
import "@testing-library/jest-dom";

// IntersectionObserverのモック
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;
