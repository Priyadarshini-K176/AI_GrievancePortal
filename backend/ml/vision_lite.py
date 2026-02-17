import sys
import json
from ultralytics import YOLO
from PIL import Image

# Load model (downloads 'yolov8n.pt' automatically on first run ~6MB)
try:
    model = YOLO('yolov8n.pt') 
except Exception as e:
    print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
    sys.exit(1)

def analyze_image(image_path):
    try:
        # Load with PIL to handle various formats (AVIF, WEBP, etc.) and convert to RGB
        try:
            img = Image.open(image_path).convert("RGB")
        except Exception as img_err:
            return {"error": f"Could not open image. Format might be unsupported. ({str(img_err)})"}

        # Run inference (verbose=False to keep stdout clean)
        results = model(img, verbose=False)
        
        # Extract detected classes
        detected_objects = []
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
                detected_objects.append(class_name)
        
        unique_objects = list(set(detected_objects))
        
        # Logic Mapping (COCO Classes to Grievance Categories)
        category = "General"
        description = f"Image contains: {', '.join(unique_objects)}"
        
        # Expanded Keyword Mapping
        road_keywords = ['car', 'truck', 'bus', 'traffic light', 'stop sign', 'bicycle', 'motorcycle', 'fire hydrant', 'parking meter']
        sanitation_keywords = ['bottle', 'cup', 'bowl', 'trash', 'waste', 'bin', 'toilet', 'mouse', 'rat'] 
        public_keywords = ['bench', 'potted plant', 'chair', 'couch', 'umbrella', 'handbag', 'backpack'] # Objects left in public
        electricity_keywords = ['tv', 'microwave', 'refrigerator', 'oven', 'toaster'] # E-waste? (Stretch)

        # Priority Logic
        if any(obj in unique_objects for obj in road_keywords):
            category = "Roads & Bridges"
            description = f"Transport/Road infrastructure found: {', '.join([o for o in unique_objects if o in road_keywords])}."
        elif any(obj in unique_objects for obj in sanitation_keywords):
            category = "Sanitation"
            description = f"Waste/Sanitation items found: {', '.join([o for o in unique_objects if o in sanitation_keywords])}."
        elif any(obj in unique_objects for obj in public_keywords):
            category = "Public Facilities"
            description = f"Public facility items found: {', '.join([o for o in unique_objects if o in public_keywords])}."
        elif len(unique_objects) > 10:
             category = "Sanitation" # Heuristic: Clutter often means garbage
             description = "High clutter detected. Likely sanitation/garbage issue."

        return {
            "category": category,
            "description": description,
            "detected_objects": unique_objects
        }

    except Exception as e:
        return {"error": f"Analysis failed: {str(e)}"}

def extract_text_from_image(image_path):
    try:
        import easyocr
        # Initialize reader (downloads model on first run)
        reader = easyocr.Reader(['en'], gpu=False) 
        result = reader.readtext(image_path, detail=0)
        text = " ".join(result)
        
        return {
            "text": text,
            "description": "OCR Extraction Complete"
        }
    except Exception as e:
        return {"error": f"OCR failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    result = analyze_image(image_path)
    print(json.dumps(result))
