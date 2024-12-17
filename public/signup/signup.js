document.querySelector("#signupButton").addEventListener("click", async function(){

    const userName = document.querySelector("#userName").value;
    const userPassword = document.querySelector("#userPassword").value;
    const userPasswordCheck = document.querySelector("#userPasswordCheck").value;

    if(!userName || !userPassword || !userPasswordCheck){ alert("이름과 비밀번호를 입력해주세요"); return; }
    if(userPassword != userPasswordCheck){ alert("비밀번호를 확인해주세요"); return; }

    const response = await fetch("/signup/auth", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ userName, userPassword })
    }).then(response => response.json());


    if(response.status == 400){ alert(response.message) }
    else { window.location.href = "/login" }
})