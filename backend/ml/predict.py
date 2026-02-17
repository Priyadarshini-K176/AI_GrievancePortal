import sys
import joblib
import json
import os

# Suppress warnings
import warnings
warnings.filterwarnings("ignore")

def predict(text):
    try:
        # Load model and vectorizer
        # Assuming they are in the same directory as this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'grievance_model.pkl')
        vectorizer_path = os.path.join(script_dir, 'tfidf_vectorizer.pkl')
        
        if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
             return {"error": "Model files not found. Please train the model first."}

        clf = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)

        # Transform input
        vect_input = vectorizer.transform([text])
        
        # Predict
        prediction = clf.predict(vect_input)[0]
        
        # Parse result
        if "|" in prediction:
            department, subtype = prediction.split("|", 1) # Split only on first | just in case
        else:
            department = prediction
            subtype = "Unknown"

        return {
            "department": department.strip(),
            "subtype": subtype.strip()
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        result = predict(input_text)
        print(json.dumps(result))
    else:
        # Read from stdin if no argument provided (useful for specialized piping)
        lines = sys.stdin.readlines()
        if lines:
            input_text = "".join(lines)
            result = predict(input_text)
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "No input text provided"}))
