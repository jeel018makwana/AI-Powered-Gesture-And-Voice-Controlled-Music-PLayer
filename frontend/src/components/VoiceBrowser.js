const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const rec = new SpeechRecognition();

rec.onresult = (e) => {
  const text = e.results[0][0].transcript;
  fetch("/api/voice_text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
};

export default function VoiceBrowser() {
  return <button onClick={() => rec.start()}>Start Voice</button>;
}
