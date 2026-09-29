type FormattedMessageProps = {
  text: string;
};

export function FormattedMessage({ text }: FormattedMessageProps) {
  const blocks = splitBlocks(text);

  return (
    <div className="formatted-message">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

function splitBlocks(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function renderBlock(block: string, index: number) {
  if (/^-{3,}$/.test(block)) {
    return <hr key={index} />;
  }

  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

  if (lines.every((line) => line.startsWith("|")) && lines.length >= 2) {
    return renderTable(lines, index);
  }

  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    return (
      <ul key={index}>
        {lines.map((line) => (
          <li key={line}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    return (
      <ol key={index}>
        {lines.map((line) => (
          <li key={line}>{renderInline(line.replace(/^\d+\.\s+/, ""))}</li>
        ))}
      </ol>
    );
  }

  const heading = block.match(/^(#{1,4})\s+(.+)$/);

  if (heading) {
    const level = Math.min(heading[1].length + 2, 6);
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    return <Tag key={index}>{renderInline(heading[2])}</Tag>;
  }

  return (
    <p key={index}>
      {lines.map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`}>
          {lineIndex > 0 ? <br /> : null}
          {renderInline(line)}
        </span>
      ))}
    </p>
  );
}

function renderTable(lines: string[], index: number) {
  const rows = lines
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter((row) => row.length > 0);

  const [head, ...body] = rows;

  if (!head) {
    return null;
  }

  return (
    <div className="message-table-wrap" key={index}>
      <table>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell}>{renderInline(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`}>
              {row.map((cell) => (
                <td key={cell}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);

    if (bold) {
      return <strong key={`${part}-${index}`}>{bold[1]}</strong>;
    }

    return part;
  });
}
