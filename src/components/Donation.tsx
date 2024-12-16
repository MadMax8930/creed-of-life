const Donation = () => {
  return (
    <div className="mt-8 text-center">
      <p>If you enjoyed this quiz, consider supporting us:</p>
      <div className="space-x-4">
        <a
          href="https://paypal.me/YOUR_LINK"
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          Donate via PayPal
        </a>
        <a
          href="https://www.buymeacoffee.com/YOUR_LINK"
          target="_blank"
          className="text-yellow-500 hover:underline"
        >
          Buy Me a Coffee
        </a>
      </div>
    </div>
  );
};

export default Donation;
