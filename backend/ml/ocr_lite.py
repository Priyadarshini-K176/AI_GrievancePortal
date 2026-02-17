import sys
import json

def extract_text(image_path):
    try:
        import easyocr
        import cv2
        import numpy as np

        # Initialize reader 
        reader = easyocr.Reader(['en'], gpu=False, verbose=False) 
        
        # Load image with OpenCV
        img = cv2.imread(image_path)
        
        # Preprocessing:
        # 1. Convert to Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 2. Apply Gaussian Blur to reduce noise
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # 3. Adaptive Thresholding (Great for documents with shadows/uneven light)
        # This keeps text black and makes background white
        processed_img = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # 4. Optional: Denoise if needed (fastNlMeansDenoising)
        # filtered = cv2.fastNlMeansDenoising(processed_img, None, 10, 7, 21)

        # Using detail=0 gives simple list of text
        # paragraph=True groups text into blocks (better for letters)
        result = reader.readtext(processed_img, detail=0, paragraph=True)
        text = "\n\n".join(result)
        
        return {
            "text": text,
            "description": "OCR Extraction Complete"
        }
    except Exception as e:
        # Check for common numpy/torch errors
        return {"error": f"OCR failed: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    result = extract_text(image_path)
    print(json.dumps(result))
