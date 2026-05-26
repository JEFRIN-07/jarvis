import keyboard
import time
import subprocess
import os

WAKE_WORD_SCRIPT = r"C:\Users\lenovo\OneDrive\Desktop\jarvis\wake-word.py"

last_press = 0
press_count = 0
wake_word_process = None

def on_dot_press(event):
    global last_press, press_count, wake_word_process
    current_time = time.time()

    if current_time - last_press < 0.5:
        press_count += 1
    else:
        press_count = 1

    last_press = current_time

    if press_count >= 2:
        press_count = 0
        if wake_word_process is None or wake_word_process.poll() is not None:
            print("✅ Double dot detected! Wake word listener starting...")
            wake_word_process = subprocess.Popen(
                f"python {WAKE_WORD_SCRIPT}",
                shell=True,
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
            print("🎤 Say 'Hello Jarvis' or 'Hello Panther' to open Jarvis!")
        else:
            print("⚠️ Wake word listener already running!")

print("⌨ Key listener ready! Double press '.' to activate!")
keyboard.on_press_key(".", on_dot_press)
keyboard.wait()