import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Fallback to 'en' if no locale is provided
  const finalLocale = locale ?? 'en';

  return {
    locale: finalLocale, // always a string
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});
