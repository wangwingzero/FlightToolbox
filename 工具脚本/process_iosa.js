const fs = require('fs');
const path = require('path');

// Path to IOSA.js
const iosaPath = path.join(__dirname, '../miniprogram/packageIOSA/IOSA.js');

console.log('Reading IOSA data from:', iosaPath);

// Helper to generate a random UUID-like string
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

try {
    // Read file content manually to handle non-JSON format if necessary, 
    // but since we are in Node, we can try to require it.
    // However, if the file has comments or other JS constructs, require is best.
    let iosaData = require(iosaPath);
    
    if (!Array.isArray(iosaData)) {
        console.error('Error: Loaded data is not an array.');
        process.exit(1);
    }

    console.log(`Loaded ${iosaData.length} terms.`);

    const originalCount = iosaData.length;
    const newTerms = [];
    const existingEnglishNames = new Set(iosaData.map(item => item.english_name.trim().toLowerCase()));

    iosaData.forEach(item => {
        if (item.equivalent_terms && typeof item.equivalent_terms === 'string') {
            const terms = item.equivalent_terms.split(/,|，/).map(t => t.trim()).filter(t => t);
            
            terms.forEach(term => {
                const termLower = term.toLowerCase();
                
                // Check if this equivalent term already exists as a main entry
                if (!existingEnglishNames.has(termLower)) {
                    console.log(`Creating new entry for equivalent term: ${term} -> ${item.english_name}`);
                    
                    const newEntry = {
                        id: generateUUID(),
                        chinese_name: item.chinese_name + ' (参见)', // Indicate it's a reference
                        english_name: term, // The equivalent term becomes the main name
                        definition: `参见：${item.english_name} (${item.chinese_name})`,
                        equivalent_terms: "", // New entry doesn't have equivalents of its own usually
                        see_also: item.english_name, // Point to original
                        see_also_array: [item.english_name],
                        source: item.source
                    };
                    
                    newTerms.push(newEntry);
                    existingEnglishNames.add(termLower); // Add to set to prevent duplicates if listed multiple times
                }
            });
        }
    });

    if (newTerms.length > 0) {
        const finalData = iosaData.concat(newTerms);
        
        // Sort alphabetically by english_name to be nice
        finalData.sort((a, b) => {
            const nameA = a.english_name.toUpperCase();
            const nameB = b.english_name.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        console.log(`Added ${newTerms.length} new terms.`);
        console.log(`Total terms: ${finalData.length}`);

        // Convert back to JS file string
        const fileContent = `// IOSA审计术语定义数据
// 数据结构支持术语间的链接跳转功能
// 数据来源：IATA Reference Manual for Audit Programs (IRM) Edition 13
// 更新时间: ${new Date().toISOString().split('T')[0]} (自动生成等效术语)

module.exports = ${JSON.stringify(finalData, null, 2)};
`;

        fs.writeFileSync(iosaPath, fileContent, 'utf8');
        console.log('Successfully updated IOSA.js');
    } else {
        console.log('No new equivalent terms found to add.');
    }

} catch (err) {
    console.error('Failed to process IOSA data:', err);
    process.exit(1);
}
