const fs = require("fs");
const data = JSON.parse(fs.readFileSync("../parliament.json", "utf8")); // Read scraped file


function splitText(text, maxLength = 7000) { // Smart split: tries sentence → word → character boundaries
    
    const chunks = [];
    let position = 0;

    while (position < text.length) {
        // If remaining text is less than maxLength, take it all
        if (text.length - position <= maxLength) {
            chunks.push(text.slice(position));
            break;
        }

        // Look ahead to maxLength position
        let splitPosition = position + maxLength;

        // Search backwards for sentence boundary (. ! ?)
        let sentenceEnd = -1;
        for (let i = splitPosition; i > position + maxLength * 0.7; i--) { // Look back up to 30% of maxLength
            if (/[.!?]\s/.test(text.slice(i - 1, i + 1))) {
                sentenceEnd = i;
                break;
            }
        }

        // If sentence boundary found, use it
        if (sentenceEnd > position) {
            chunks.push(text.slice(position, sentenceEnd + 1).trim());
            position = sentenceEnd + 1;
            continue;
        }

        // Search backwards for word boundary (space)
        let wordBoundary = -1;
        for (let i = splitPosition; i > position + maxLength * 0.7; i--) {
            if (/\s/.test(text[i])) {
                wordBoundary = i;
                break;
            }
        }

        // If word boundary found, use it
        if (wordBoundary > position) {
            chunks.push(text.slice(position, wordBoundary + 1).trim());
            position = wordBoundary + 1;
            continue;
        }

        // Fallback: character boundary (avoid cutting in middle if possible)
        // Try to find any whitespace near the end
        let spaceNearEnd = text.lastIndexOf(' ', splitPosition);
        if (spaceNearEnd > position + maxLength * 0.9) {
            chunks.push(text.slice(position, spaceNearEnd + 1).trim());
            position = spaceNearEnd + 1;
        } else {
            // No choice: split at character boundary
            chunks.push(text.slice(position, splitPosition));
            position = splitPosition;
        }
    }

    return chunks;
}

const output = [];

for (const article of data) {
  if (!article.content) continue;

  if (article.content.length > 7000) {
    const parts = splitText(article.content, 7000);
    parts.forEach((part, index) => {
      output.push({
        id: `${article.id}-${index + 1}`,
        url: article.url,
        title: article.title,
        date: article.date,
        category: article.category,
        part: index + 1,
        totalParts: parts.length,
        content: part,
      });
    });
  } else {
    output.push(article);
  }
}


fs.writeFileSync("../parliament_split.json", JSON.stringify(output, null, 2), "utf8");
console.log(`✅ Done! Saved ${output.length} records to parliament_split.json`);