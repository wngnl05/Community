const express = require('express');
const router = express.Router();

const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, S3 } = require('@aws-sdk/client-s3'); // Aws S3
require('dotenv').config("../..");


router.use(express.json());

router.use(async (req, res, next) => {
    if(req.session && req.session.userName){ return res.redirect("/product") }
    next();
})

router.get('/', async (req, res) => { res.sendFile("signup.html", { root: "public/signup/" }) })



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


router.post('/auth', async (req, res) => {
    try{
        const {userName, userPassword} = req.body;

        // S3 데이터 가져오기
        const s3Response = JSON.parse(await s3StreamToString( (await s3.send(new GetObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/user.json` }))).Body )) || [];
        
        // 가입 되어있는지 확인
        const userCheck = s3Response.filter( e => e.userName == userName ) || undefined;
        if(userCheck.length != 0){ return res.status(400).json({message: "사용중인 닉네임 입니다."}) }
    
        // 이메일 비밀번호 추가
        s3Response.push({userName, userPassword})
        await s3.send(new PutObjectCommand({ Bucket: s3Bucket, Key: `${s3Folder}/user.json`, Body: JSON.stringify( s3Response ), ContentType: 'application/json' }));
    
        res.status(200).send("signup successful")
    }
    catch(error){
        console.log(error)
        res.status(400).json({message: "error"})
    }
})



module.exports = router