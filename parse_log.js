const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('/Users/apple/.gemini/antigravity/brain/fe1be1e5-0822-4318-a3c3-04939d20bace/.system_generated/logs/overview.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount === 311) {
      try {
        const obj = JSON.parse(line);
        const text = obj.content;
        const index = text.indexOf('Quy tắc 3:');
        if (index !== -1) {
          console.log(text.substring(index, index + 1500));
        } else {
          console.log("Could not find 'Quy tắc 3:' in content. Printing from index 1500:");
          console.log(text.substring(1500, 3000));
        }
      } catch (e) {
        console.error("Error:", e);
      }
      break;
    }
  }
}

processLineByLine();
