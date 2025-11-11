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

// Rastgele parıltı efektleri oluştur
        function createSparkles() {
            const sparkleCount = 50;
            for (let i = 0; i < sparkleCount; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * 100 + '%';
                sparkle.style.top = Math.random() * 100 + '%';
                sparkle.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(sparkle);
            }
        }

        createSparkles();

        // Form submit örneği
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            document.getElementById('responseMessage').textContent = 'Giriş yapılıyor...';
        });