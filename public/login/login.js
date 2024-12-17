document.querySelector("#LoginButton").addEventListener("click", async function(){

    const userName = document.querySelector("#userName").value;
    const userPassword = document.querySelector("#userPassword").value;

    if(!userName || !userPassword){ alert("이름과 비밀번호를 입력해주세요"); return; }

    const response = await fetch("/login/auth", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ userName, userPassword })
    })


    if(!response.ok){
        alert((await response.json().catch(() => ({ message: "An unknown error occurred." }))).message || "An error occurred.");
        return;
    }
    
    alert("게시판 이용 시 서로를 존중하며, 건전한 커뮤니티 문화를 만들어주세요.");
    window.location.href = "/board"
})