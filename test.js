const { FileManager } = require('./fileManager');

const fm = new FileManager('./test_files');

console.log('=== File Manager Testing ===\n');

console.log('1. Creating test files...');
console.log(fm.createFile('hello.txt', 'Hello, World!'));
console.log(fm.createFile('data.json', '{"name": "John", "age": 30}'));
console.log(fm.createFile('empty.txt'));

console.log('\n2. Listing files...');
const listResult = fm.listFiles();
if (listResult.success) {
    console.log('Files found:');
    listResult.files.forEach(file => {
        console.log(`- ${file.name} (${file.size} bytes)`);
    });
}

console.log('\n3. Reading files...');
console.log('Reading hello.txt:');
const readResult = fm.readFile('hello.txt');
if (readResult.success) {
    console.log(`Content: "${readResult.content}"`);
}

console.log('\nReading data.json:');
const jsonResult = fm.readFile('data.json');
if (jsonResult.success) {
    console.log(`Content: ${jsonResult.content}`);
    try {
        const parsed = JSON.parse(jsonResult.content);
        console.log('Parsed JSON:', parsed);
    } catch (e) {
        console.log('Invalid JSON');
    }
}

console.log('\n4. Testing error handling...');
console.log(fm.readFile('nonexistent.txt'));

console.log('\n5. Deleting a file...');
console.log(fm.deleteFile('empty.txt'));

console.log('\n6. Final file list...');
const finalList = fm.listFiles();
if (finalList.success) {
    console.log('Remaining files:');
    finalList.files.forEach(file => {
        console.log(`- ${file.name} (${file.size} bytes)`);
    });
}

console.log('\n=== Testing Complete ===');