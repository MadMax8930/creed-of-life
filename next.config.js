module.exports = {
   reactStrictMode: true,
   i18n: {
     locales: ['en', 'es', 'fr', 'ru', 'th'],
     defaultLocale: 'en'
   },
   images: {
      remotePatterns: [
         {
           protocol: 'https',
           hostname: 'flagcdn.com',
           port: '',
           pathname: '/w320/*',
         },
       ],
   },
};