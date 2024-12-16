import { FC } from 'react';

interface QuestionProps {
  question: {
    id: number;
    question: string;
    type: string;
    answers: { text: string; score: number }[];
    description: string;
  };
  onAnswer: (score: number) => void;
}

const Question: FC<QuestionProps> = ({ question, onAnswer }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded">
      <h2 className="font-semibold">{question.question}</h2>
      {question.answers.map((answer, index) => (
        <label key={index} className="block my-2">
          <input
            type={question.type}
            name={`question-${question.id}`}
            value={answer.score}
            onChange={() => onAnswer(answer.score)}
            className="mr-2"
          />
          {answer.text}
        </label>
      ))}
      <p className="text-sm text-gray-600 mt-2">{question.description}</p>
    </div>
  );
};

export default Question;
