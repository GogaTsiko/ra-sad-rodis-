import os
import sys
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import json
import time
import queue
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from flask import Flask, render_template, request, jsonify, Response

# Import team members
import sporti
import istorikosi
import enatmcodne
import geografi
import lideri

app = Flask(__name__)

TEAM_MEMBERS = [
    {
        "id": "sporti",
        "name": "სპორტის ექსპერტი",
        "role": "სპორტი, რეკორდები და შეჯიბრებები",
        "badge": "⚽ სპორტი",
        "color": "#38bdf8",
        "avatar": "⚽",
        "desc": "ფეხბურთი, ოლიმპიური თამაშები, ცნობილი ათლეტები და ჩემპიონატები"
    },
    {
        "id": "istorikosi",
        "name": "ისტორიკოსი",
        "role": "ისტორია, თარიღები და ეპოქები",
        "badge": "📜 ისტორია",
        "color": "#f59e0b",
        "avatar": "📜",
        "desc": "მსოფლიო და საქართველოს ისტორიული ფაქტები, მოვლენები და მოღვაწეები"
    },
    {
        "id": "enatmcodne",
        "name": "ენათმეცნიერი",
        "role": "ენათმეცნიერება, ეტიმოლოგია და ლიტერატურა",
        "badge": "📖 ენათმეცნიერება",
        "color": "#a855f7",
        "avatar": "📖",
        "desc": "სიტყვების წარმოშობა, ლიტერატურული ნაწარმოებები, ენობრივი ლოგიკა"
    },
    {
        "id": "geografi",
        "name": "გეოგრაფი",
        "role": "გეოგრაფია, ქვეყნები და ბუნება",
        "badge": "🌍 გეოგრაფია",
        "color": "#10b981",
        "avatar": "🌍",
        "desc": "ქვეყნები, დედაქალაქები, მთები, მდინარეები და კლიმატური ზონები"
    }
]

PRESET_QUESTIONS = [
    {
        "title": "ოლიმპიური თამაშები",
        "question": "რომელ წელს და რომელ ქალაქში ჩატარდა პირველი თანამედროვე ოლიმპიური თამაშები?"
    },
    {
        "title": "მსოფლიოს მწვერვალი",
        "question": "რომელ ორ ქვეყანას შორის მდებარეობს ევერესტის მწვერვალი და რა ჰქვია მას ტიბეტურად?"
    },
    {
        "title": "ვეფხისტყაოსნის ეპოქა",
        "question": "რომელი ქართველი მეფის ეპოქაში შეიქმნა „ვეფხისტყაოსანი“ და ვის ეძღვნება პოემის პროლოგი?"
    },
    {
        "title": "მარათონის ლეგენდა",
        "question": "რომელი ბერძენი მალემსრბოლის ლეგენდა უდევს საფუძვლად თანამედროვე 42.195 კმ-იან მარათონულ რბენას?"
    }
]

def query_member(member_id: str, question: str) -> dict:
    start_time = time.time()
    try:
        if member_id == "sporti":
            ans = sporti.ask(question)
        elif member_id == "istorikosi":
            ans = istorikosi.ask(question)
        elif member_id == "enatmcodne":
            ans = enatmcodne.ask(question)
        elif member_id == "geografi":
            ans = geografi.ask(question)
        else:
            ans = "უცნობი ექსპერტი"
    except Exception as e:
        ans = f"დაფიქსირდა შეცდომა პასუხის მიღებისას: {e}"
    
    elapsed = round(time.time() - start_time, 2)
    return {
        "id": member_id,
        "answer": ans,
        "elapsed": elapsed
    }

def query_leader(question: str, member_answers: dict) -> dict:
    start_time = time.time()
    combined_prompt = f"""
    შეკითხვა: {question}
    სპორტი: {member_answers.get('sporti', '')}
    ისტორიკოსი: {member_answers.get('istorikosi', '')}
    ენათმეცნიერი: {member_answers.get('enatmcodne', '')}
    გეოგრაფი: {member_answers.get('geografi', '')}
"""
    try:
        ans = lideri.ask(combined_prompt)
    except Exception as e:
        ans = f"ლიდერის შეცდომა: {e}"

    elapsed = round(time.time() - start_time, 2)
    return {
        "id": "lideri",
        "answer": ans,
        "elapsed": elapsed,
        "submitted_prompt": combined_prompt
    }

@app.route("/")
def index():
    return render_template("index.html", team=TEAM_MEMBERS, presets=PRESET_QUESTIONS)

@app.route("/api/team")
def get_team():
    return jsonify({
        "members": TEAM_MEMBERS,
        "leader": {
            "id": "lideri",
            "name": "გუნდის კაპიტანი / ლიდერი",
            "role": "ვერსიების სინთეზი, შეფასება და საბოლოო პასუხი",
            "badge": "👑 კაპიტანი",
            "color": "#eab308",
            "avatar": "🦉"
        }
    })

@app.route("/api/presets")
def get_presets():
    return jsonify(PRESET_QUESTIONS)

@app.route("/api/ask", methods=["POST"])
def ask_all():
    data = request.get_json() or {}
    question = (data.get("question") or "").strip()
    if not question:
        return jsonify({"error": "გთხოვთ შეიყვანოთ შეკითხვა"}), 400

    member_results = {}
    total_start = time.time()

    # Run all 4 team members concurrently
    with ThreadPoolExecutor(max_workers=4) as executor:
        future_to_id = {
            executor.submit(query_member, m["id"], question): m["id"]
            for m in TEAM_MEMBERS
        }
        for future in as_completed(future_to_id):
            res = future.result()
            member_results[res["id"]] = res

    # Extract clean text for leader
    answers_text = {mid: res["answer"] for mid, res in member_results.items()}

    # Call leader
    leader_result = query_leader(question, answers_text)
    total_elapsed = round(time.time() - total_start, 2)

    return jsonify({
        "question": question,
        "members": member_results,
        "leader": leader_result,
        "total_elapsed": total_elapsed
    })

@app.route("/api/stream")
def stream_deliberation():
    question = (request.args.get("question") or "").strip()
    if not question:
        return jsonify({"error": "გთხოვთ შეიყვანოთ შეკითხვა"}), 400

    def event_stream():
        yield f"event: start\ndata: {json.dumps({'message': 'ვოლჩოკი დატრიალდა! კითხვა მიღებულია.'})}\n\n"
        
        member_results = {}
        msg_queue = queue.Queue()

        def worker(m_id):
            res = query_member(m_id, question)
            msg_queue.put(res)

        # Launch 4 member threads
        threads = []
        for m in TEAM_MEMBERS:
            t = threading.Thread(target=worker, args=(m["id"],))
            t.daemon = True
            t.start()
            threads.append(t)

        # Stream each member as soon as finished
        finished_count = 0
        while finished_count < len(TEAM_MEMBERS):
            try:
                res = msg_queue.get(timeout=30)
                member_results[res["id"]] = res
                finished_count += 1
                yield f"event: member\ndata: {json.dumps(res)}\n\n"
            except queue.Empty:
                break

        yield f"event: status\ndata: {json.dumps({'message': 'ყველა ვერსია მიღებულია. კითხვა და ვერსიები გადაეცემა ლიდერს...'})}\n\n"

        # Now execute leader
        answers_text = {mid: res["answer"] for mid, res in member_results.items()}
        leader_result = query_leader(question, answers_text)
        yield f"event: leader\ndata: {json.dumps(leader_result)}\n\n"
        yield f"event: done\ndata: {json.dumps({'message': 'განხილვა დასრულებულია!'})}\n\n"

    return Response(event_stream(), mimetype="text/event-stream")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"„რა? სად? როდის?“ სერვერი ეშვება მისამართზე http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
