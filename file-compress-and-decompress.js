
const fs = require('fs');// dosya işlemleri için require ettim
const zlib = require('zlib'); // compress etmek için require ettim.
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

const rawFile = 'data.txt';


if (rawFile === '') {
    throw new Error('Please add file for to be compress and decompress!!!');
}

const fileNameWithoutExtension = rawFile.split('.')[0];

const fileForBrotli = fileNameWithoutExtension + '.brotli';
const fileForGzip = fileNameWithoutExtension + '.gz';


async function runBrotli() {
    try {
        console.time('BROTLI COMPRESS TIME'); // timer başlangıcı 

        await pipelineAsync(
            fs.createReadStream(rawFile),// girilen dosyanın stream halinde okumasını sağlar 
            zlib.createBrotliCompress(), // Dosyayı brotli haline compress ediyorum
            fs.createWriteStream(fileForBrotli),// dosyanın write stream halinde yazılmasını sağlar
        );
        console.timeEnd('BROTLI COMPRESS TIME'); // timer ı sonlandırdım 
        console.log('BROTLI COMPRESS SIZE:', fs.statSync(fileForBrotli).size + ' byte'); // fs.stat ile <filename>.brotli için size bilgisi aldım
        // file.stat senkron olmazsa yanıt alınmıyor

        // Aynı şeyleri decompress için yapıyorum.
        console.time('BROTLI DECOMPRESS TIME');
        await pipelineAsync(
            fs.createReadStream(fileForBrotli),
            zlib.createBrotliDecompress(),
            fs.createWriteStream(rawFile),
        );

        console.timeEnd('BROTLI DECOMPRESS TIME');
        console.log('BROTLI DECOMPRESS SIZE:', fs.statSync(rawFile).size + ' byte');

    } catch (err) {
        console.error('failed', err);
    }
}

async function runGzip() {
    // aynı şekilde gzip için oluşturuyorum.
    console.time('GZIP COMPRESS TIME');
    try {
        await pipelineAsync(
            fs.createReadStream(rawFile),
            zlib.createGzip(),
            fs.createWriteStream(fileForGzip),
        );
        console.timeEnd('GZIP COMPRESS TIME');
        console.log('GZIP COMPRESS SIZE:', fs.statSync(fileForGzip).size + ' byte'); // fs.stat'ı senkronize çalıştırmamız gerekli. 

        console.time('GZIP DECOMPRESS TIME');

        await pipelineAsync(
            fs.createReadStream(fileForGzip),
            zlib.createUnzip(),
            fs.createWriteStream(rawFile),
        );

        console.timeEnd('GZIP DECOMPRESS TIME');
        console.log('GZIP DECOMPRESS SIZE:', fs.statSync(rawFile).size + ' byte');
    } catch (err) {
        console.error('failed.', err);
    }
}

async function main() {
    console.log("COMPRESS AND DECOMPRESS PROCESS STARTED SUCCESSFULY...");
    await runBrotli();
    console.log("--------------------------------------------------------");
    await runGzip();
    console.log("FILES COMPRESSED AND DECOMPRESSED COMPLETED SUCCESSFULY...");
}

main();