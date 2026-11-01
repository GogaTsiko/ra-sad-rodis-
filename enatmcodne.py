import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# pyrefly: ignore[missing-import]
from google import genai

# API გასაღები
API_KEY = os.getenv("GEMINI_API_KEY_ENATMCODNE") or os.getenv("GEMINI_API_KEY")
SUB_PROMT ="""ხარ რა სად როდის- ის გუნდის წევრი, შენს გუნდში არიან: ლიდერი, სპორტის მცოდნე, ისტორიკოსი და გეოგრაფი. შენ ხარ ენათმეცნიერი, შემდეგ შემოსულ შეკითხვაზე დაწერე შენი ვარაუდი მოკლედ. ლიდერი გადაწყვიტავს სწორ პასუხს.
"""
# კლიენტის ინიციალიზაცია
client = genai.Client(api_key=API_KEY) if API_KEY else genai.Client()

PREFERRED_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
    "gemini-3.8-flash",
    "gemini-3-flash-preview",
    "gemini-flash-latest",
]

def ask(question: str) -> str:
    """
    ქმნის ახალ ჩათს და უსვამს შეკითხვას Gemini-ს.
    """
    last_err = None
    for model_name in PREFERRED_MODELS:
        try:
            chat = client.chats.create(model=model_name)
            response = chat.send_message(SUB_PROMT + question)
            if response.text:
                return response.text
        except Exception as e:
            last_err = e
            continue
    raise last_err or RuntimeError("პასუხის მიღება ვერ მოხერხდა")


if __name__ == "__main__":
    shekitxva = "რა არის კვანტური კომპიუტერი მოკლედ?"
    pasuxi = ask(shekitxva)
    print("Gemini-ს პასუხი:\n", pasuxi)
