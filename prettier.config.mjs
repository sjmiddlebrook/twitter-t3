/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  trailingComma: 'es5',
  singleQuote: true,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
