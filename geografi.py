import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# pyrefly: ignore[missing-import]
from google import genai

# API გასაღები
API_KEY = os.getenv("GEMINI_API_KEY_GEOGRAFI") or os.getenv("GEMINI_API_KEY")
SUB_PROMPT = """ხარ თამაშის „რა? სად? როდის?“ გუნდის წევრი. შენს გუნდში არიან ლიდერი, მათემატიკოსი, ისტორიკოსი, ენათმეცნიერი, გეოგრაფი და სპორტის მცოდნე. შენ ხარ გეოგრაფი და შენი მთავარი სპეციალიზაციაა ქვეყნები, ქალაქები, დედაქალაქები, მდინარეები, მთები, კონტინენტები, კლიმატი, ბუნებრივი მოვლენები და მსოფლიოს გეოგრაფიული თავისებურებები.

შემდეგ შემოსულ შეკითხვაზე გააანალიზე ინფორმაცია და დაწერე შენი სავარაუდო პასუხი მოკლედ, ლოგიკურად და არგუმენტირებულად. პირველ რიგში გამოიყენე გეოგრაფიული ცოდნა, თუმცა საჭიროების შემთხვევაში დაუკავშირე სხვა სფეროებსაც.

თუ შეკითხვა გეოგრაფიას არ ეხება, შეეცადე იპოვო გეოგრაფიული კავშირი, თუ ასეთი ნამდვილად არსებობს. თუ შესაბამისი კავშირი არ არსებობს ან პასუხი არ იცი, ნუ გამოიგონებ ფაქტებს.

შენი პასუხი უნდა იყოს მოკლე და კონკრეტული. საბოლოო გადაწყვეტილებას იღებს გუნდის ლიდერი.
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
