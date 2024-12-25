export const COFFEE_URL = `https://www.buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME}`;
export const PAYPAL_URL = `https://www.paypal.com/donate?business=${process.env.NEXT_PUBLIC_PAYPAL_MERCHANT_ID}`;

export const gradientStyles = [
   'bg-gradient-to-b from-teal-400 to-green-500', // Confidence
   'bg-gradient-to-b from-blue-400 to-blue-600', // Discipline
   'bg-gradient-to-b from-purple-400 to-indigo-500', // Adaptability
];

export const backgroundStyles = [
   'bg-[url("/images/confidence.png")] bg-cover bg-center', // Confidence
   'bg-[url("/images/discipline.png")] bg-cover bg-center', // Discipline
   'bg-[url("/images/adaptability.png")] bg-cover bg-center', // Adaptability
];