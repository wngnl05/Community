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
    })


    if(!response.ok){
        alert((await response.json().catch(() => ({ message: "An unknown error occurred." }))).message || "An error occurred.");
        return;
    }
    
    alert("회원가입이 정상적으로 완료되었습니다.")
    window.location.href = "/login"
})