import json
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.1"

def call_llama(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }
    )
    data = response.json()
    return data["response"]

def evaluate_submission(text, rubric=None, example_answer=None):
    prompt = f"""
            You are an AI grading assistant. Evaluate the student's submission based on:.
            1. Rubric (if provided)
            2. The example answer (if provided)


            Submission:
            {text}

            Rubric:
            {rubric or "None provided"}

            Example Answer:
            {example_answer or "None provided"}


            Return ONLY valid JSON with:
            - strengths: list of strings
            - weaknesses: list of strings
            - missing_requirements: list of strings
            - similarity_score (0-100)
            - suggested_score: integer 0-100
            - feedback_paragraph: string
            """

    raw = call_llama(prompt)
    # Try to extract JSON safely
    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        json_str = raw[start:end]
        return json.loads(json_str)
    except Exception:
        return {"error": "Invalid JSON from model", "raw": raw}

    # return json.dumps({
    #     "strengths": ["Good understanding of the topic", "Well-structured answer"],
    #     "weaknesses": ["Could use more specific examples"],
    #     "missing_requirements": [],
    #     "suggested_score": 85,
    #     "feedback_paragraph": "The submission demonstrates a solid understanding of the topic and is well-structured. However, it could benefit from more specific examples to illustrate key points."
    # })