import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

print("Loading dataset...")
# 1️⃣ Load CSV
try:
    df = pd.read_csv("tn_grievance_ml_fullname.csv")
except FileNotFoundError:
    print("Error: 'tn_grievance_ml_fullname.csv' not found. Run dataset_generator.py first.")
    exit(1)

# 2️⃣ Encode Department + Subtype as single target
# The user's goal is to predict both. A simple way is to predict the combined string.
df['Target'] = df['Department'] + "|" + df['Subtype']

# 3️⃣ Split data
X = df['text']
y = df['Target']

# 4️⃣ TF-IDF Vectorizer
print("Vectorizing text...")
vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
X_vect = vectorizer.fit_transform(X)

# 5️⃣ Train classifier
print("Training model...")
clf = LogisticRegression(max_iter=500) # Increased max_iter for convergence
clf.fit(X_vect, y)

# 6️⃣ Save Model and Vectorizer
print("Saving model and vectorizer...")
joblib.dump(clf, 'grievance_model.pkl')
joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')

print("Model trained and saved successfully!")
