function setUsername(){
    var username = document.getElementById("username-input").value;
    console.log(username);
    localStorage.setItem("username", username);
    window.location.href = "chat.html";
}