// /public/js/login.js

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", function(event) {
    event.preventDefault(); // Formun otomatik yenilenmesini engeller

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Giriş bilgileri kontrolü (örnek)
    if (username === "admin" && password === "1234") {
      // Başarılı giriş → anasayfa.html'e yönlendir
      window.location.href = "anasayfa.html";
    } else {
      alert("Kullanıcı adı veya şifre hatalı!");
    }
  });
});
