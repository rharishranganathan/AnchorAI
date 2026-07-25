import asyncio
import os
import google.generativeai as genai

async def test_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    print(f"Testing with API Key: {api_key[:5]}...{api_key[-5:]}")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name="gemini-flash-latest")
    try:
        response = await model.generate_content_async("Respond with exactly 'OK'")
        print("Response from Gemini:", response.text.strip())
        if "OK" in response.text:
            print("API Key is VALID and working!")
        else:
            print("Received unexpected response.")
    except Exception as e:
        print("API Key test FAILED:", e)

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(test_gemini())
