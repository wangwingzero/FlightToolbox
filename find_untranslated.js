const fs = require('fs');
const readline = require('readline');

async function findUntranslated() {
    const inputFile =
      '/d/FlightToolbox/miniprogram/packageC/english-shortname-airports.js';
    const outputFile = '/d/FlightToolbox/untranslated_names.txt';
    const untranslated = new Set();

    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if (line.includes('"ShortName":')) {
            const match = line.match(/"ShortName":\s*"([^"]*)"/);
            if (match && match[1]) {
                const name = match[1];
                // A simple regex to check if the name is likely
                // English/untranslated.
                // This checks for the presence of at least one English
                // letter.
                if (/[a-zA-Z]/.test(name) && !/[\u4e00-\u9fa5]/.test
                   (name)) {
                    untranslated.add(name);
                }
            }
        }
    }

    const outputStream = fs.createWriteStream(outputFile);
    untranslated.forEach(name => outputStream.write(name + '\n'));
    outputStream.end();

    console.log(`Found ${untranslated.size} untranslated names. List written to ${outputFile}`);
}

findUntranslated().catch(console.error);