import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import sporti, istorikosi, enatmcodne, geografi, lideri


question = input("შეიყვანე შეკითხვა : ")
sporti_answer = sporti.ask(question)
print(f"სპორტი: {sporti_answer}")
istori_answer = istorikosi.ask(question)
print(f"ისტორიკოსი: {istori_answer}")
enatm_answer = enatmcodne.ask(question)
print(f"ენათმეცნიერი: {enatm_answer}")
geografi_answer = geografi.ask(question)
print(f"გეოგრაფი: {geografi_answer}")
ans = f"""
    შეკითხვა: {question}
    სპორტი: {sporti_answer}
    ისტორიკოსი: {istori_answer}
    ენათმეცნიერი: {enatm_answer}
    გეოგრაფი: {geografi_answer}
    
"""
led_ans = lideri.ask(ans)
print(f"ლიდერი: {led_ans}")