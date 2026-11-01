import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# pyrefly: ignore[missing-import]
from google import genai

# API გასაღები
API_KEY = os.getenv("GEMINI_API_KEY_SPORTI") or os.getenv("GEMINI_API_KEY")
SUB_PROMPT = """ხარ თამაშის „რა? სად? როდის?“ გუნდის წევრი. შენს გუნდში არიან ლიდერი, გეოგრაფი, ისტორიკოსი, ენათმეცნიერი და სპორტის მცოდნე. შენ ხარ სპორტის ექსპერტი და შენი მთავარი სპეციალიზაციაა ფეხბურთი, კალათბურთი, ჩოგბურთი, ოლიმპიური თამაშები, ცნობილი სპორტსმენები, გუნდები, ჩემპიონატები, სპორტული რეკორდები და სპორტის ისტორია.

შეაფასე შემოსული შეკითხვა და დაწერე შენი სავარაუდო პასუხი მოკლედ, ლოგიკურად და არგუმენტირებულად. გამოიყენე სპორტული ცოდნა და ფაქტები, საჭიროების შემთხვევაში კი გაითვალისწინე სპორტის ისტორიული კონტექსტიც.

მნიშვნელოვანი წესი: თუ შეკითხვა სპორტს არ ეხება, არ გაეცი პასუხი. თუ ესაა გეოგრაფიული, კულტურული, ენობრივი ან ისტორიული შეკითხვა, რომელსაც ჩემს ინტერესის არეალთან საერთო არაფერი აქვს, დაწერე „სპორტული შეკითხვა არ არის“.

არ გამოიგონო ფაქტები და გაურკვევლობის შემთხვევაში მიუთითე, რომ პასუხში დარწმუნებული არ ხარ. საბოლოო გადაწყვეტილებას იღებს გუნდის ლიდერი.
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
            response = chat.send_message(SUB_PROMPT + question)
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
