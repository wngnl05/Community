// 데이터 요청 함수
async function base() {
    return await fetch("/board/base", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    }).then(response => response.json());
}

// 전역 상태
let baseData = null;

// 로그인 확인 및 초기화
(async () => {
    baseData = await base(); // 한 번만 호출하여 결과 저장
    const { userName = null } = baseData;

    if (userName) {
        document.querySelector("#guestHeader").style.display = "none";
        document.querySelector("#userHeader").style.display = "block";
    }

    const nid = new URLSearchParams(window.location.search).get("nid");
    if (nid) await createDetailBoard(nid);
    await createBoard();
})();

// 쿠키 가져오기
const userCookie = decodeURIComponent(document.cookie.match(/(^| )userName=([^;]+)/)?.[2]);



// 게시물 목록 생성
async function createBoard() {
    const { product } = baseData;
    // 초기화
    document.querySelector("#boardTable tbody").innerHTML = ""; 
    // 글 가져오기기
    product.reverse().forEach(({ userName, id, title }, index) => {
        const formattedDate = `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)} ${id.slice(8, 10)}:${id.slice(10, 12)}`;
        document.querySelector("#boardTable tbody").innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td onclick="window.location.href='/board?nid=${id}'">${title}</td>
                <td>${userName}</td>
                <td>${formattedDate}</td>
            </tr>`;
    });
}

// 상세 게시물 보기
async function createDetailBoard(nid) {

    const { product } = baseData;
    const detailData = product.find(b => b.id == nid);
    if (!detailData) return;

    const { userName, id, title, content, comments } = detailData;
    const formattedDate = `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)} ${id.slice(8, 10)}:${id.slice(10, 12)}`;
    const commentHtml = comments
        .map(({ userName, comment }) => `<span class="comment">${userName}: ${comment}</span>`)
        .join("");

    const deleteButton = userName == userCookie ? `<button onclick="deleteBoard(${id})">삭제</button>` : "";

    document.querySelector("#boardDetail").style.display = "block";
    document.querySelector("#boardDetail").innerHTML = `
        <div id="detailTitle">
            <div id="detailTitleContainer">
                <b>${title}</b>
                <span>${userName} ${formattedDate}</span>
            </div>
            ${deleteButton}
        </div>
        <div id="detailContent">${content}</div>
        <div id="detailComment">
            <b>댓글</b>
            ${commentHtml}
            <textarea placeholder="댓글을 입력해주세요"></textarea>
            <div><button onclick="writeComment(${id})">작성</button></div>
        </div>`;
}

// 게시물 검색
function searchBoard(event=null){
    if(event && event.key != "Enter"){ return; }
    // 검색어 없으면
    const searchText = document.querySelector("#headerContainer input").value;
    if(!searchText){ alert("검색어를 입력해주세요.") }
    // 검색하기
    const { product } = baseData;
    const searchProduct = product.filter(b => b.title.includes(searchText));
    // 검색값 없으면
    if(searchProduct.length==0){
        alert("검색된 값이 없습니다.");
        return;
    }

    // 초기화
    document.querySelector("#boardTable tbody").innerHTML = ""; 
    // 글 가져오기기
    searchProduct.forEach(({ userName, id, title }, index) => {
        const formattedDate = `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)} ${id.slice(8, 10)}:${id.slice(10, 12)}`;
        document.querySelector("#boardTable tbody").innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td onclick="window.location.href='/board?nid=${id}'">${title}</td>
                <td>${userName}</td>
                <td>${formattedDate}</td>
            </tr>`;
    });
}


// 게시물 작성 모달 열기
async function openModal() {
    const { userName = null } = baseData;
    if (!userName) return alert("로그인을 해주세요.");

    document.querySelector("#boardModalContent input").value = "";
    document.querySelector("#boardModalContent textarea").value = "";
    document.querySelector("#simpleModal").style.display = "block";
}

// 게시물 저장
async function writeBoard() {
    const title = document.querySelector("#boardModalContent input").value.trim();
    const content = document.querySelector("#boardModalContent textarea").value.trim();

    if (!title || !content) return alert("제목과 본문을 입력해주세요.");

    await fetch("/board/writeBoard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
    });

    window.location.reload();
}

// 게시물 삭제
async function deleteBoard(id) {
    if (confirm("삭제하시겠습니까?")) {
        await fetch("/board/deleteBoard", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        }).then(response => response.json());

        window.location.href = "/board";
    }
}



// 댓글 작성
async function writeComment(id) {
    const { userName = null } = baseData;
    if (!userName) return alert("로그인을 해주세요.");

    const comment = document.querySelector("#detailComment textarea").value.trim();
    if (!comment) return alert("댓글을 작성해주세요.");

    await fetch("/board/writeComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, comment }),
    });

    window.location.reload();
}