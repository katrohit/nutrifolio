
import React from 'react';

interface EmailSentCardProps {
  title: string;
  description: string;
}

const EmailSentCard = ({ title, description }: EmailSentCardProps) => {
  return (
    <div className="text-center">
      <div className="mb-4 text-6xl">✉️</div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default EmailSentCard;
