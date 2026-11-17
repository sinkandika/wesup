"use client";

interface FormattedDateProps {
  dateString: string | Date;
  className?: string;
}

// FULL DATE ROWS
export default function FormattedDate({ dateString, className }: FormattedDateProps) {
  // Safe parsing in case dateString is undefined or invalid
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return <span className={className}>-</span>;
  }

  return (
    <span className={className}>
      {date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace('.',':')
      }
    </span>
  );
};

// FULL DATE COLUMN
export function FormattedDateCols({ dateString, className }: FormattedDateProps) {
  // Safe parsing in case dateString is undefined or invalid
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return <span className={className}>-</span>;
  }

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <span className="whitespace-nowrap">
        {date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })}
      </span>
      <span className="whitespace-nowrap">
        {date.toLocaleString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace('.',':')
        }
      </span>
    </div>
  );
};
