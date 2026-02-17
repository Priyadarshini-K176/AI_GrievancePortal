import sys
import json
import spacy

# Load small English model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback if not downloaded
    print(json.dumps({"error": "Model not found. Run: python -m spacy download en_core_web_sm"}))
    sys.exit(1)

def extract_entities(text):
    doc = nlp(text)
    
    entities = {
        "GPE": [],      # Countries, cities, states
        "LOC": [],      # Non-GPE locations, mountain ranges, bodies of water
        "FAC": [],      # Buildings, airports, highways, bridges, etc.
        "ORG": [],      # Companies, agencies, institutions, etc.
        "DATE": [],     # Absolute or relative dates or periods
        "TIME": []      # Times smaller than a day
    }
    
    for ent in doc.ents:
        if ent.label_ in entities:
            entities[ent.label_].append(ent.text)
            
    # Logic to guess Jurisdiction from GPE/LOC
    jurisdiction = "General"
    locations = entities["GPE"] + entities["LOC"] + entities["FAC"]
    
    if locations:
        jurisdiction = locations[0] # Pick first detected location

    # --- Keyword Categorization Logic ---
    text_lower = text.lower()
    category = "Other"

    keywords = {
        "Roads & Bridges": ["road", "street", "pothole", "bridge", "light", "traffic", "tar", "highway"],
        "Water Supply": ["water", "pipe", "leak", "sewage", "drain", "drinking", "supply", "tap"],
        "Sanitation": ["garbage", "trash", "waste", "dustbin", "clean", "smell", "dump", "mosquito"],
        "Electricity": ["power", "current", "voltage", "pole", "wire", "electric", "eb", "light"]
    }

    for dept, keys in keywords.items():
        if any(k in text_lower for k in keys):
            category = dept
            break
            
    return {
        "category": category, # Added field
        "jurisdiction": jurisdiction,
        "all_locations": locations,
        "organizations": entities["ORG"],
        "dates": entities["DATE"]
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No text provided"}))
        sys.exit(1)
        
    text = sys.argv[1]
    result = extract_entities(text)
    print(json.dumps(result))
