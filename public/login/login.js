document.querySelector("#LoginButton").addEventListener("click", async function(){

    const userName = document.querySelector("#userName").value;
    const userPassword = document.querySelector("#userPassword").value;

    if(!userName || !userPassword){ alert("이름과 비밀번호를 입력해주세요"); return; }

    const response = await fetch("/login/auth", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ userName, userPassword })
    }).then(response => response.json());


    if(response.status == 400){ alert(response.message) }
    else { window.location.href = "/board" }
})