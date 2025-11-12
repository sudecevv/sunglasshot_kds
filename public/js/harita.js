document.addEventListener("DOMContentLoaded", () => {

    // 🌍 1️⃣ SATIŞ HARİTASI
    const map = L.map('map').setView([38.42, 27.14], 10); // İzmir merkezi
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    fetch("http://localhost:3000/api/satis-harita")
        .then(res => res.json())
        .then(data => {
            const coordinates = []; // 🔸 Şube konumlarını saklayacağız

            data.forEach(sube => {
                let color;
                if (sube.toplam_satis < 13000) color = "green";
                else if (sube.toplam_satis >= 13000 && sube.toplam_satis <= 14000) color = "blue";
                else color = "red";

                // 🔹 Marker oluştur
                const marker = L.circleMarker([sube.lat, sube.lon], {
                    radius: 9,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                    weight: 2
                }).addTo(map);

                // 🔹 Popup ekle
                marker.bindPopup(`
                    <b>${sube.sube_ad}</b><br>
                    Toplam Satış: ${sube.toplam_satis.toLocaleString("tr-TR")}
                `);

                coordinates.push([sube.lat, sube.lon]);
            });

            // 🔸 Şubeleri bağlayan kesikli çizgi (turuncu)
            if (coordinates.length > 1) {
                L.polyline(coordinates, {
                    color: "orange",
                    weight: 3,
                    opacity: 0.8,
                    dashArray: "6, 8"
                }).addTo(map);
            }
        })
        .catch(err => console.error("🚨 Satış haritası verisi alınamadı:", err));



    // 👥 2️⃣ NÜFUS HARİTASI
    const populationMap = L.map('population-map').setView([38.42, 27.14], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(populationMap);

    fetch("http://localhost:3000/api/nufus-harita")
        .then(res => res.json())
        .then(data => {
            data.forEach(ilce => {
                let color;
                if (ilce.nufus2025 < 100000) color = "green";
                else if (ilce.nufus2025 >= 100000 && ilce.nufus2025 <= 300000) color = "blue";
                else color = "red";

                const marker = L.circleMarker([ilce.lat, ilce.lon], {
                    radius: 9,
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                    weight: 2
                }).addTo(populationMap);

                marker.bindPopup(`
                    <b>${ilce.ilce_ad}</b><br>
                    Nüfus: ${ilce.nufus2025.toLocaleString("tr-TR")}
                `);
            });
        })
        .catch(err => console.error("🚨 Nüfus haritası verisi alınamadı:", err));



    // 📊 3️⃣ GRAFİK (Şube Satışları)
    fetch("http://localhost:3000/api/satis-harita")
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById("districtChart").getContext("2d");

            const labels = data.map(item => item.sube_ad);
            const values = data.map(item => item.toplam_satis);

            // 🎨 Göz alıcı sabit renk paleti
            const backgroundColors = [
                "#FF6700", "#FF9900", "#FFB84D", "#FF3D00", "#FF7043",
                "#FFAB40", "#FF8A00", "#E65100", "#FF5722", "#F57C00"
            ];

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Toplam Satışlar",
                        data: values,
                        backgroundColor: backgroundColors.slice(0, values.length),
                        borderColor: "#fff",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: "Şubelere Göre Satış Performansı",
                            font: { size: 18, weight: "bold" },
                            color: "#1c1c1c"
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: "#1c1c1c",
                                font: { size: 12, weight: "600" }
                            },
                            grid: { display: false }
                        },
                        y: {
                            ticks: {
                                color: "#1c1c1c",
                                font: { size: 12 },
                                beginAtZero: true
                            },
                            grid: { color: "rgba(0,0,0,0.05)" }
                        }
                    }
                }
            });
        })
        .catch(err => console.error("🚨 Grafik verisi alınamadı:", err));

});
