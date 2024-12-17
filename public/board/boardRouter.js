const express = require('express');
const router = express.Router();

const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, S3 } = require('@aws-sdk/client-s3'); // Aws S3
require('dotenv').config("../..");



router.use(express.json());

router.get('/', async (req, res) => { res.sendFile("board.html", { root: "public/board/" }) })




const s3Bucket = "wngnl-bucket"
const s3Folder = "community"

const s3 = new S3Client({
    region: process.env.AwsRegion,
    credentials: {
        accessKeyId: process.env.AwsAccess,
        secretAccessKey: process.env.AwsSecret,
    }
});

// S3 스트림을 문자열로 변환하는 함수
function s3StreamToString(stream) {
    return new Promise((resolve, reject) => {
        let data = '';
        stream.on('data', chunk => data += chunk);
        stream.on('end', () => resolve(data));
        stream.on('error', reject);
    });
}



router.get('/base', async (req, res) => {
    try{
        // S3 데이터 반환하기
        const userName = req.session.userName;
        const product = JSON.parse(await s3StreamToString( (await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/board.json` }))).Body )) || [];
        res.status(200).json({ userName, product })
    }
    catch(error){
        console.log(error)
        res.status(400).json({ message: "오류가 발생했습니다." })
    }
})



// 로그인 user만 접근
router.use(async (req, res, next) => {
    if(req.session && req.session.userName){ next() }
    else{ return res.json({ status: 400, message: "로그인을 해주세요" }) }
})

router.post('/writeBoard', async (req, res) => {
    try{
        const {title, content} = req.body;
        const userName = req.session.userName;

        const id = new Date(new Date().getTime() + (9 * 60 * 60 * 1000)).toISOString().replace(/[-T:]/g, '').slice(0, 14);

        // S3 데이터 가져오기
        const s3Response = JSON.parse(await s3StreamToString( (await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/board.json` }))).Body )) || [];

        // 본문 추가
        s3Response.push({userName, id, title, content, comments: [] })
        await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/board.json`, Body: JSON.stringify( s3Response ), ContentType: 'application/json' }));
        res.json({ status: 200 })
    }
    catch(error){
        console.log(error)
        res.json({ status: 400, message: "오류가 발생했습니다." })
    }
})


router.post('/writeComment', async (req, res) => {
    try{
        const {id, comment} = req.body;
        const userName = req.session.userName;

        // S3 데이터 가져오기
        const s3Response = JSON.parse(await s3StreamToString( (await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/board.json` }))).Body )) || [];
        
        const commentBoard = s3Response.map(board => {
            if (board.id == id) { board.comments.push({userName, comment}) }
            return board;
        });

        await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/board.json`, Body: JSON.stringify( commentBoard ), ContentType: 'application/json' }));
        res.json({ status: 200 })
    }
    catch(error){
        console.log(error)
        res.json({ status: 400, message: "오류가 발생했습니다." })
    }
})


router.post('/deleteBoard', async (req, res) => {
    try{
        const {id} = req.body;
        const userName = req.session.userName;
        console.log(id, userName)
        const s3Response = JSON.parse(await s3StreamToString( (await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/board.json` }))).Body )) || [];
        const deleteElement = s3Response.filter(b => !(b.id == id && b.userName == userName));

        await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/board.json`, Body: JSON.stringify( deleteElement ), ContentType: 'application/json' }));
        res.json({ status: 200 })
    }
    catch(error){
        console.log(error)
        res.json({ status: 400, message: "오류가 발생했습니다." })
    }
})


module.exports = router