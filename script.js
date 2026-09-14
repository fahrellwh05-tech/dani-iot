// Koneksi ke broker HiveMQ via WebSocket (TLS)
const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

const statusEl = document.getElementById("status");

client.on("connect", () => {
  statusEl.textContent = "Terhubung ke broker ✅";
  statusEl.style.color = "#9be89b";

  client.subscribe("rifky/sensor/suhu");
  client.subscribe("rifky/sensor/kelembapan");
  client.subscribe("rifky/sensor/tekanan");
});

client.on("message", (topic, message) => {
  const value = message.toString();

  if (topic === "rifky/sensor/suhu") {
    document.getElementById("suhu").textContent = value;
  } else if (topic === "rifky/sensor/kelembapan") {
    document.getElementById("kelembapan").textContent = value;
  } else if (topic === "rifky/sensor/tekanan") {
    document.getElementById("tekanan").textContent = value;
  }
});

client.on("error", (err) => {
  statusEl.textContent = "Gagal konek ke broker ❌";
  statusEl.style.color = "#ff6b6b";
  console.error(err);
});

client.on("close", () => {
  statusEl.textContent = "Koneksi terputus, mencoba lagi...";
  statusEl.style.color = "#ffcc00";
});
