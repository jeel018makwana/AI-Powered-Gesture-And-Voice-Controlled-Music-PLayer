import React, { useEffect, useState } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceWake() {
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!SpeechRecognition) return alert("Your browser does not support Speech Recognition");

    const wakeRec = new SpeechRecognition();
    wakeRec.continuous = true;  // Continuous wake word listening
    wakeRec.interimResults = false;
    wakeRec.lang = "en-US";

    wakeRec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        console.log("Detected:", transcript);

        if (transcript.includes("hey player")) {
          console.log("🎤 Wake Word Detected! Starting voice commands...");
          fetch("/api/voice_active", { method: "POST" });
          startVoiceCommands();
        }
      }
    };

    wakeRec.onend = () => wakeRec.start(); // Restart for continuous listening
    wakeRec.start();

    const startVoiceCommands = () => {
      const cmdRec = new SpeechRecognition();
      cmdRec.continuous = false;
      cmdRec.interimResults = false;
      cmdRec.lang = "en-US";

      cmdRec.onresult = (e) => {
        const command = e.results[0][0].transcript.toLowerCase();
        console.log("🎵 Command Detected:", command);

        // Play by song name
        if (command.startsWith("play ")) {
          const songName = command.replace("play ", "").trim();
          fetch("/api/play_by_name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: songName })
          }).then(res => res.json())
            .then(data => console.log(data));
        } else {
          // Other commands
          fetch("/api/voice_text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: command })
          });
        }
      };

      cmdRec.onend = () => {
        fetch("/api/voice_inactive", { method: "POST" });
      };

      cmdRec.start();
      setListening(true);
    };
  }, []);

  return <div>{listening ? "🎤 Listening for command..." : "💤 Waiting for wake word..."}</div>;
}
