import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as utils from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(utils.cn('a', 'b')).toContain('a');
    });
  });

  describe('getDataByTool', () => {
    const tool = 'test-tool';
    beforeEach(() => {
      vi.stubGlobal('window', Object.create(window));
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => JSON.stringify({ foo: 'bar' })),
      });
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });
    it('should get data from localStorage', () => {
      expect(utils.getDataByTool(tool)).toEqual({ foo: 'bar' });
    });
  });

  describe('createShareUrl', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        location: { origin: 'http://localhost', pathname: '/test' },
      });
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });
    it('should create a share url', () => {
      const url = utils.createShareUrl({ foo: 'bar' });
      expect(url).toContain('http://localhost/test?lz=1&data=');
    });
  });

  describe('loadSharedData', () => {
    beforeEach(() => {
      // Set up the URL with the expected params
      const url = new URL(window.location.href);
      url.search = '?lz=1&data=eyJmb28iOiJiYXIifQ%3D%3D';
      window.history.pushState({}, '', url.toString());
      // Mock LZString
      vi.stubGlobal('LZString', {
        decompressFromEncodedURIComponent: () => '{"foo":"bar"}',
      });
    });
    afterEach(() => {
      vi.unstubAllGlobals();
      window.history.pushState({}, '', '/');
    });
    it('should load shared data from url', () => {
      expect(utils.loadSharedData()).toEqual({ foo: 'bar' });
    });
  });

  describe('scrollToBottom', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        scrollTo: vi.fn(),
      });
      vi.stubGlobal('document', {
        body: { scrollHeight: 1000 },
      });
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });
    it('should call window.scrollTo', () => {
      utils.scrollToBottom();
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
    });
  });
});
