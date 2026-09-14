// ==== Konfigurasi rentang tiap gauge (untuk menghitung isi arc) ====
const ranges = {
  suhu: { min: 0, max: 50 },
  kelembapan: { min: 0, max: 100 },
  tekanan: { min: 950, max: 1050 },
};

const arcIds = {
  suhu: "arcSuhu",
  kelembapan: "arcKelembapan",
  tekanan: "arcTekanan",
};

// Siapkan panjang path tiap arc (dipanggil sekali di awal)
const arcLengths = {};
Object.keys(arcIds).forEach((key) => {
  const el = document.getElementById(arcIds[key]);
  const length = el.getTotalLength();
  arcLengths[key] = length;
  el.style.strokeDasharray = length;
  el.style.strokeDashoffset = length; // mulai kosong
});

function updateGauge(key, value) {
  const { min, max } = ranges[key];
  const clamped = Math.min(Math.max(value, min), max);
  const percent = (clamped - min) / (max - min);

  const el = document.getElementById(arcIds[key]);
  const length = arcLengths[key];
  el.style.strokeDashoffset = length * (1 - percent);
}

function updateTimestamp() {
  const now = new Date();
  const jam = now.toLocaleTimeString("id-ID");
  document.getElementById("lastUpdate").textContent = "terakhir update " + jam;
}

// ==== Status koneksi ====
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

function setStatus(state, message) {
  statusDot.className = "status__dot";
  if (state === "live") statusDot.classList.add("status__dot--live");
  if (state === "error") statusDot.classList.add("status__dot--error");
  statusText.textContent = message;
}

// ==== Koneksi MQTT ke broker HiveMQ (WebSocket + TLS) ====
const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

client.on("connect", () => {
  setStatus("live", "tersambung");
  client.subscribe("rifky/sensor/suhu");
  client.subscribe("rifky/sensor/kelembapan");
  client.subscribe("rifky/sensor/tekanan");
});

client.on("message", (topic, message) => {
  const value = parseFloat(message.toString());
  if (isNaN(value)) return;

  if (topic === "rifky/sensor/suhu") {
    document.getElementById("suhu").textContent = value.toFixed(1);
    updateGauge("suhu", value);
  } else if (topic === "rifky/sensor/kelembapan") {
    document.getElementById("kelembapan").textContent = value.toFixed(1);
    updateGauge("kelembapan", value);
  } else if (topic === "rifky/sensor/tekanan") {
    document.getElementById("tekanan").textContent = value.toFixed(1);
    updateGauge("tekanan", value);
  }

  updateTimestamp();
});

client.on("error", (err) => {
  setStatus("error", "gagal konek");
  console.error(err);
});

client.on("close", () => {
  setStatus("error", "terputus, mencoba lagi…");
});
