import speech_recognition as sr
import subprocess
import time
import os
import sys

WAKE_WORDS = ["hello jarvis", "hey jarvis", "hello panther", "hey panther", "hello blackpearl", "blackpearl"]
JARVIS_BAT = r"C:\Users\lenovo\OneDrive\Desktop\jarvis\start-jarvis.bat"

jarvis_opened = False

def open_jarvis():
    global jarvis_opened
    print("✅ Wake word detected! Opening Jarvis...")
    subprocess.Popen(JARVIS_BAT, shell=True)
    jarvis_opened = True
    print("✅ Jarvis opened! Stopping wake word listener.")
    sys.exit(0)  # Stop after opening — double (.) will restart

def listen():
    r = sr.Recognizer()
    r.energy_threshold = 300
    r.dynamic_energy_threshold = True

    print("=" * 40)
    print("  WAKE WORD LISTENER ACTIVE")
    print("  Say 'Hello Jarvis' or 'Hello Panther'")
    print("=" * 40)

    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source, duration=1)
        while True:
            try:
                audio = r.listen(source, timeout=5, phrase_time_limit=4)
                text = r.recognize_google(audio).lower().strip()
                print(f"Heard: {text}")

                for word in WAKE_WORDS:
                    if word in text:
                        open_jarvis()
                        return

            except sr.WaitTimeoutError:
                pass
            except sr.UnknownValueError:
                pass
            except KeyboardInterrupt:
                print("Wake word listener stopped.")
                sys.exit(0)
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(1)

if __name__ == "__main__":
    listen()