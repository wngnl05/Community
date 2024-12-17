const express = require('express');
const router = express.Router();

const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, S3 } = require('@aws-sdk/client-s3'); // Aws S3
require('dotenv').config("../..");


router.use(express.json());

router.use(async (req, res, next) => {
    if(req.session && req.session.userName){ return res.redirect("/product") }
    next();
})

router.get('/', async (req, res) => { res.sendFile("login.html", { root: "public/login/" }) })



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
        if(userCheck.length == 0){ return res.json({ status: 400, message: "가입되어 있지 않은 계정입니다." }) }
        if(userPassword != userCheck[0].userPassword){ return res.json({ status: 400, message: "비밀번호가 틀렸습니다" }) }

        res.cookie("userName", userName, { maxAge: 1000 * 60 * 60 * 24 });
        req.session.userName = userName;
        req.session.save(() => {});
        res.json({ status: 200 })
    }
    catch(error){
        console.log(error)
        res.json({ status: 400, message: "오류가 발생했습니다." })
    }
})



module.exports = router