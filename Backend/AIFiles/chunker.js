
function chunkText(text, maxChars = 3000, overlap = 300) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(text.length, start + maxChars);
        chunks.push(text.slice(start, end).trim());
        start = end - overlap;
        if (start < 0) start = 0;
        if (end === text.length) break;
    }
    return chunks;
}

module.exports = { chunkText }