// __mocks__/next-navigation.js

module.exports = {
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => ({ get: vi.fn() }),
  useParams: () => ({}),
  useSelectedLayoutSegments: () => [],
};
