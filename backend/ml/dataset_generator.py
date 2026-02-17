import pandas as pd
import random

# Departments with full names and their subtypes
departments_subtypes = {
    "Adi Dravidar and Tribal Welfare Department": [
        "Adi Dravidar Colony Infrastructure",
        "Agriculture Borewell",
        "Atrocities on SC/ST",
        "Brick Kiln",
        "Burial Ground",
        "Chicken Unit",
        "Cleanliness Workers Welfare Board",
        "Community Hall",
        "Complaint on Officers - ADW",
        "e - Patta-ADW",
        "Employee Grievances - DADW",
        "Employee Grievances - DTW",
        "Employee Grievances - TAHDCO",
        "Entrepreneur Development Scheme",
        "Farmer Solar Dryer",
        "Fast Track Power Supply",
        "Forest Rights",
        "Free Bicycle - ADW",
        "Free House Site Patta",
        "Garments and Leather Units"
    ],
    "Animal Husbandry and Dairying and Fisheries and Fishermen Welfare Department": [
        "Aavin",
        "Complaint on Officers - AHFISH",
        "Employee Grievances - AAVIN",
        "Employee Grievances - AH",
        "Employee Grievances - FISH",
        "Employee Grievances - MILKPROD",
        "Fish Market Complaints",
        "Fisheries Welfare Schemes",
        "Fishermen Welfare - FISH",
        "Inland Fishing Complaints",
        "Livestock Poultry Farming",
        "Marine Complaints",
        "Milk Production",
        "Other petitions - Aavin",
        "Other Petitions - AH",
        "Other Petitions - FISH"
    ],
    "Handlooms Handicrafts Textiles and Khadi Department": [
        "Beekeeping Farmers Grievances",
        "Co-Optex Union Request/Grievances",
        "Cocoon Price",
        "Complaint on Officers - HHTK",
        "Complaints on Personnel - Co-optex",
        "Cooperative - Spinning Mills - Related",
        "Distribution of Raw Materials Finished Goods",
        "Drip Irrigation",
        "Employee Grievances - CO-OPTEX",
        "Employee Grievances - KHADI"
    ],
    "Health and Family Welfare Department": [
        "108 Ambulance Services",
        "Absence of Doctors - Indian Medicine",
        "Adulteration - Drug Admin",
        "Blood Bank License",
        "Blood Storage Centre License",
        "Care and Support for AIDS Patients",
        "Cataract Operations",
        "Civil Structures - Health System",
        "CMCHIS insurance card - Related",
        "Complaint on Officers - HEALTH"
    ],
    "Human Resources Management Department": [
        "Corruption in Scheme/Contract/Tender",
        "Demand of Bribes",
        "Disciplinary Petitions",
        "Disproportionate Assets",
        "Employee Grievances - Human Resources",
        "Misappropriation of funds",
        "Policy Matters - PAR",
        "Promotional Issues",
        "Seniority Issues",
        "Suggestions - Human Resources"
    ],
    "Industries Department": [
        "Afforestation",
        "Amma Cement Request",
        "Area Subsidy",
        "Cane Payment Pending",
        "Complaint on Officers - IND",
        "Delay in Project Completion",
        "Delay in Sanction of Term Loan",
        "Dust Emanation from Crushing Units",
        "Employee Grievances - GUIDANCE",
        "Employee Grievances - SALT"
    ],
    "Public Department": [
        "Accident Relief Assistance - Refugees",
        "Action Against Fraudulent / Unregistered Recruiting Agents - NRT",
        "Arrange to Get Death Related Documents from Sponsors - NRT",
        "Camp Transfer from District To District - Refugees",
        "Change of Home Address of Soldier - ExSMWel",
        "Citizenship - Refugees",
        "Compassionate Ground Appointment - ExSMWel"
    ],
    "School Education Department": [
        "Bicycle - SE",
        "Bus Pass to School Students - SE",
        "Compensation for Loss of Parents in Accident - SE",
        "Complaint on Officers - SCHOOL",
        "Complaints Against Educational Institutions - Elementary",
        "Complaints Against Educational Institutions - Matric"
    ],
    "Tourism Culture and Religious Endowments Department": [
        "Annadhanam Scheme Request",
        "Basic Infrastructures in Tourist Places",
        "Civic Amenities",
        "Complaint on Officers - TOURCUL",
        "Conducting of Festivals",
        "Control Over Mismanagement Temple",
        "Cow Donation",
        "Declaration of Destination as Tourist Place"
    ],
    "Transport Department": [
        "Compensation-Accident Cases - SETC",
        "Complaint on Drivers and Conductors - MTC",
        "Complaint on Drivers and Conductors - SETC",
        "Complaint on Officers - TRANS",
        "Disabled Persons Free Bus Pass - MTC",
        "Disabled Persons Free Bus Pass - TNSTC",
        "Employee Grievances - IRT",
        "Employee Grievances - MTC",
        "Employee Grievances - SETC",
        "Employee Grievances - TNSTC"
    ]
}

rows = []

# Specific synonyms and variations for better training
common_variations = [
    "I have a complaint regarding {subtype} in my area.",
    "Issue with {subtype}, please look into it.",
    "There is a problem with {subtype} department services.",
    "Urgent help needed for {subtype}.",
    "Requesting action on {subtype}.",
    "My grievance is about {subtype}.",
]

# CUSTOM LOGIC: Add heavy weights to specific problem phrases
# This ensures "bus transport" aligns with Transport Dept, not School Education

transport_phrases = [
    "No proper bus transport in our area",
    "Bus is not coming to my street",
    "Public transport is very bad",
    "Need more buses in my route",
    "Bus conductor was rude",
    "Driver drove rashly",
    "Bus breakdown frequently",
    "bus timing is not correct",
    "Lack of bus facility",
    "Bus stop is damaged"
]

school_bus_pass_phrases = [
    "I need a bus pass for my school child",
    "School bus pass not received",
    "Apply for student bus pass",
    "Renewal of school bus pass",
    "Free bus pass for students"
]

for dept_name, subtypes in departments_subtypes.items():
    for subtype in subtypes:
        # 1. Standard Variations
        for template in common_variations:
            rows.append([dept_name, template.format(subtype=subtype.lower()), subtype])
        
        # 2. Add the subtype itself as a keyword
        rows.append([dept_name, subtype, subtype])

        # 3. Custom Logic for Transport vs School
        if dept_name == "Transport Department":
            # Add general transport phrases mapped to a relevant subtype (e.g., MTC/TNSTC)
            # We map general "bus transport" issues to 'Complaint on Drivers and Conductors - MTC' 
            # OR we can just pick a generic one if available. 
            # Since user complained about "no proper bus transport", let's map it to 'Employee Grievances - TNSTC' or similar if no better fit,
            # BUT better to map to 'Complaint on Drivers and Conductors - MTC' or just create a general pattern.
            # Actually, looking at list: "Disabled Persons Free Bus Pass - MTC" exists.
            # Let's map these general phrases to "Complaint on Drivers and Conductors - MTC" for now as it's the closest operational category
            for phrase in transport_phrases:
                rows.append([dept_name, phrase, "Complaint on Drivers and Conductors - MTC"])
        
        if dept_name == "School Education Department" and "Bus Pass" in subtype:
            # Overweight specific school bus pass phrases
             for phrase in school_bus_pass_phrases:
                rows.append([dept_name, phrase, subtype])


# Create DataFrame
df = pd.DataFrame(rows, columns=["Department", "text", "Subtype"])

# Shuffle
df = df.sample(frac=1).reset_index(drop=True)

# Save CSV
df.to_csv("tn_grievance_ml_fullname.csv", index=False)
print("CSV 'tn_grievance_ml_fullname.csv' generated successfully with enhanced examples!")
