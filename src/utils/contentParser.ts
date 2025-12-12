export interface ParsedPage {
  pageNumber: number;
  content: string;
}

export function parseAndPaginateContent(fullText: string, charsPerPage: number = 2000): ParsedPage[] {
  // Find the starting section
  const startPattern = /Alternative Learning System K to 12 Basic Education Curriculum \(ALS K to 12 BEC\)/i;
  const match = fullText.match(startPattern);
  
  let relevantContent: string;
  
  if (match && match.index !== undefined) {
    // Extract content from the matched section onwards
    relevantContent = fullText.substring(match.index);
  } else {
    // If pattern not found, use full content
    relevantContent = fullText;
  }

  // Split content into pages
  const pages: ParsedPage[] = [];
  let currentPosition = 0;
  let pageNumber = 1;

  while (currentPosition < relevantContent.length) {
    const endPosition = Math.min(currentPosition + charsPerPage, relevantContent.length);
    
    // Try to break at a paragraph or sentence to avoid cutting words
    let breakPoint = endPosition;
    if (endPosition < relevantContent.length) {
      const lastNewline = relevantContent.lastIndexOf('\n', endPosition);
      const lastPeriod = relevantContent.lastIndexOf('. ', endPosition);
      const minBreak = currentPosition + Math.floor(charsPerPage * 0.7);
      
      if (lastNewline > minBreak) {
        breakPoint = lastNewline + 1;
      } else if (lastPeriod > minBreak) {
        breakPoint = lastPeriod + 2;
      }
    }

    pages.push({
      pageNumber,
      content: relevantContent.substring(currentPosition, breakPoint).trim()
    });

    currentPosition = breakPoint;
    pageNumber++;
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, content: fullText }];
}