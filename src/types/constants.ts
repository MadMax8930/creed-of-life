export const COFFEE_URL = `https://www.buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME}`;
export const PAYPAL_URL = `https://www.paypal.com/donate?business=${process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID}`;

// Pillars
export const backgroundStyles = [
   'bg-[url("/images/confidence.png")] bg-cover bg-center font-10 sm:text-xl xs:text-lg text-base', // Confidence
   'bg-[url("/images/discipline.png")] bg-cover bg-center font-10 sm:text-xl xs:text-lg text-base', // Discipline
   'bg-[url("/images/adaptability.png")] bg-cover bg-center font-10 sm:text-xl xs:text-lg text-base', // Adaptability
];

// Branches
export const gradientStyles = [
   'bg-gradient-to-b from-teal-400 to-green-500', // Confidence
   'bg-gradient-to-b from-purple-400 to-indigo-500', // Discipline
   'bg-gradient-to-b from-yellow-400 to-orange-500', // Adaptability
];