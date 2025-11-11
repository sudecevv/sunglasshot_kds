document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/api/kampanya-gelirleri")
        .then(res => {
            if (!res.ok) {
                console.error("Sunucu hata kodu:", res.status);
                return res.text().then(text => console.error("Cevap (text):", text));
            }
            return res.json();
        })
        .then(data => {
            const tbody = document.querySelector("#past-campaign-table tbody");
            tbody.innerHTML = "";

            data.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.kampanya_ad}</td>
                    <td>${item.baslangic} - ${item.bitis}</td>
                    <td>${Number(item.toplam_kazanc).toLocaleString('tr-TR')} ₺</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});
