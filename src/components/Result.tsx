import { FC } from 'react';

interface ResultProps {
  score: number;
  total: number;
  onRestart: () => void;
}

const Result: FC<ResultProps> = ({ score, total, onRestart }) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="p-4 bg-white shadow-md rounded">
      <h2 className="text-lg font-semibold">Your Score: {percentage}%</h2>
      <button
        onClick={onRestart}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 mt-4"
      >
        Start Over
      </button>
    </div>
  );
};

export default Result;
