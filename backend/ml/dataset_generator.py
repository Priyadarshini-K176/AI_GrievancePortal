import pandas as pd
import random

# FULL LIST OF 37 DEPARTMENTS & SYNTHETIC SUB-TYPES
departments_subtypes = {
    "Adi Dravidar and Tribal Welfare Department (ADW)": [
        "Scholarship Issue - ADW", "Hostel Facility - ADW", "Community Certificate Delay", 
        "Atrocities on SC/ST", "Free House Site Patta - ADW"
    ],
    "Agriculture and Farmers welfares Department (AGRI)": [
        "Crop Insurance Claim", "Fertilizer Shortage", "Seed Quality Issue", 
        "Farm Machinery Subsidy", "Pest Attack Support"
    ],
    "Animal Husbandry and Dairying and Fisheries and Fishermen Welfare Department (AHFISH)": [
        "Veterinary Doctor Unavailable", "Cattle Feed Shortage", "Milk Procurement Price", 
        "Fishing Ban Relief", "Boat Diesel Subsidy"
    ],
    "BC MBC and Minorities Welfare Department (BCMBC)": [
        "Scholarship - BC/MBC", "Hostel Food Quality", "Free Tools Scheme", 
        "Ulema Pension Scheme", "Narikkuravar Welfare Board"
    ],
    "Co-operation Food and Consumer Protection Department (FOODCO)": [
        "Ration Shop Closed", "Ration Rice Quality", "Weight Measurement Fraud", 
        "Co-operative Loan Issue", "Consumer Court Complaint"
    ],
    "Commercial Taxes and Registration Department (CTREG)": [
        "GST Return Issue", "Property Registration Delay", "Encumbrance Certificate Error", 
        "Guide Value Query", "Tax Refund Delay"
    ],
    "Energy Department (ENERGY)": [
        "Frequent Power Cuts", "High Electricity Bill", "Meter Fault / Replacement", 
        "New Connection Delay", "Transformer Sparking/Fire"
    ],
    "Environment Climate Change and Forests Department (ENVFOR)": [
        "Industrial Pollution", "Illegal Tree Cutting", "Wild Animal Intrusion", 
        "Plastic Waste Ban Violation", "Forest Fire Reporting"
    ],
    "Finance Department (FIN)": [
        "Pension Disbursement Delay", "Treasury Bill Pending", "GPF/CPS Settlement", 
        "Government Employee Salary Issue", "Retired Employee Benefits"
    ],
    "Handlooms Handicrafts Textiles and Khadi Department (HHTK)": [
        "Weaver ID Card Issue", "Yarn Subsidy Not Received", "Co-optex Sales Payment", 
        "Powerloom Electricity Subsidy", "Handicraft Artisan Loan"
    ],
    "Health and Family Welfare Department (HEALTH)": [
        "Doctor Absent in GH", "Medicine Shortage", "108 Ambulance Delay", 
        "Sanitation in Hospital", "Dengue/Malaria Outbreak"
    ],
    "Higher Education Department (HIGHEDU)": [
        "College Admission Issue", "University Exam Results", "Professor Vacancy", 
        "College Infrastructure", "RUSA Fund Utilization"
    ],
    "Highways and Minor Ports Department (HWY)": [
        "State Highway Potholes", "Road Widening Encroachment", "Toll Plaza Excess Fee", 
        "Bridge Construction Delay", "Road Signage Missing"
    ],
    "Human Resources Management Department (PAR)": [
        "Govt Job Recruitment Scam", "Transfer/Posting Request", "Service Register Entry Missing", 
        "Disciplinary Action Appeal", "Compassionate Appointment Delay"
    ],
    "Home Prohibition and Excise Department (HOMEEXC)": [
        "Illicit Liquor Sale", "Police Inaction", "FIR Registration Refusal", 
        "Cyber Crime Complaint", "Prison Inmate Welfare"
    ],
    "Housing and Urban Development Department (HUD)": [
        "DTCP Approval Delay", "Unapproved Layout Plot", "TNHB Allotment Issue", 
        "Slum Clearance Board Tenement", "Rental Dispute"
    ],
    "Industries Department (IND)": [
        "SIPCOT Land Allotment", "Industrial Subsidy Delay", "Single Window Clearance", 
        "Factory Closure Notice", "Industrial Safety Violation"
    ],
    "Information Technology Department (IT)": [
        "e-Sevai Centre Closed", "Server Down / Website Crash", "Broadband Connectivity Infrastructure", 
        "IT Park Facilities", "Government Email Issue"
    ],
    "Labour Welfare and Skill Development Department (LBREMP)": [
        "PF Claim Settlement", "Unfair Dismissal", "Minimum Wages Violation", 
        "Construction Workers Board", "Skill Training Application"
    ],
    "Law Department (LAW)": [
        "Legal Aid Request", "Court Case Pending", "Notary Public Complaint", 
        "Law College Admission", "Government Pleader Issue"
    ],
    "Legislative Assembly Department (LEGIS)": [
        "MLA Constituency Fund", "Assembly Proceedings Query", "MLA Office Not Open", 
        "Petition to Assembly Committee"
    ],
    "Micro Small and Medium Enterprises Department (MSME)": [
        "MUDRA Loan Rejection", "Udyam Registration Error", "MSME Subsidy Delay", 
        "Industrial Shed Allotment", "Raw Material Cost"
    ],
    "Municipal Administration and Water Supply Department (MAWS)": [
        "No Water Supply", "Drainage Blockage", "Garbage Not Collected", 
        "Street Light Not Working", "Property Tax Issue", "Road Damage", "Pothole Patchwork"
    ],
    "Public Elections Department (ELECTION)": [
        "Voter ID Card Not Received", "Name Missing in Voter List", "Polling Booth Complaint", 
        "Electoral Roll Correction", "Candidate Malpractice"
    ],
    "Public Department (PUBLIC)": [
        "Chief Minister's Special Cell", "Freedom Fighter Pension", "Ex-Servicemen Welfare", 
        "Law and Order General", "Protocol Violation"
    ],
    "Public Works Department (PWD)": [
        "Govt Building Maintenance", "Dam Water Release", "Irrigation Canal Cleaning", 
        "Lake Encroachment", "PWD Guest House Booking"
    ],
    "Revenue and Disaster Management Department (REV)": [
        "Patta / Chitta Transfer", "Income/Community Certificate", "Cyclone Relief Not Received", 
        "Land Survey Request", "Old Age Pension (OAP)"
    ],
    "Rural Development and Panchayat Raj Department (RDPR)": [
        "Village Road Damaged", "NREGA Wages Pending", "Panchayat Tax Issue", 
        "Village Water Tank Cleaning", "Gram Sabha Meeting"
    ],
    "School Education Department (SCHOOL)": [
        "School Admission Denied", "Teacher Absenteeism", "School Building Dilapidated", 
        "Mid-day Meal Scheme", "RTE Seat Allotment"
    ],
    "Social Welfare and Women Empowerment Department (SWNM)": [
        "Widow Pension", "Marriage Assistance Scheme", "Domestic Violence Helpline", 
        "Child Marriage Reporting", "Working Women Hostel"
    ],
    "Tamil Dev. and Information Department (TAMINF)": [
        "Tamil Scholar Pension", "Press/Media Accreditation", "Government Exhibition", 
        "Memorial Maintenance", "Tamil Book Publication"
    ],
    "Tourism Culture and Religious Endowments Department (TOURCUL)": [
        "Temple Maintenance", "Annadhanam Quality", "Tourist Spot Facilities", 
        "Hotel Registration", "Heritage Site Protection"
    ],
    "Transport Department (TRANS)": [
        "Bus Not Stopping", "Bus Pass Issue", "Conductor Rude Behavior", 
        "RTO License Delay", "Overcrowding in Bus"
    ],
    "Welfare of Differently Abled Persons (DIFFABLE)": [
        "Disability ID Card", "Tricycle/Scooter Request", "Special School Admission", 
        "Maintenance Allowance", "Accessibility in Public Buildings"
    ],
    "Youth Welfare and Sports Development Department (YOUTHSP)": [
        "Playground Maintenance", "Sports Kit Request", "Stadium Booking", 
        "Sports Scholarship", "Gym Equipment"
    ],
    "Water Resources Department (WRD)": [
        "River Sand Mining", "Check Dam Construction", "Groundwater Depletion", 
        "Canal Encroachment", "Water Release for Farming"
    ],
    "Planning Development Department (PLGDEV)": [
        "State Scheme Implementation", "District Development Plan", "SDG Goals Monitoring", 
        "Statistics Data Request"
    ],
    "Special Programme Implementation (SPI)": [
        "Scheme Monitoring", "Flagship Project Delay", "Announcement Implementation"
    ]
}

rows = []

# Phrase Templates for Training
common_variations = [
    "I have a complaint regarding {subtype}.",
    "Issue with {subtype}, please resolve.",
    "My grievance is about {subtype}.",
    "Requesting help with {subtype}.",
    "Problem faced: {subtype}.",
    "Complaint against {dept} for {subtype}.",
    "Urgent action needed on {subtype}.",
    "We are suffering due to {subtype}.",
    "Please look into this {subtype} matter.",
    "Report on {subtype}."
]

# Generate Data
for dept_name, subtypes in departments_subtypes.items():
    # Extract short code if present for cleaner text generation
    dept_short = dept_name.split('(')[-1].strip(')') if '(' in dept_name else dept_name
    
    for subtype in subtypes:
        # 1. Template Variations
        for template in common_variations:
            text = template.format(subtype=subtype.lower(), dept=dept_short)
            rows.append([dept_name, text, subtype])
        
        # 2. Key phrases
        rows.append([dept_name, subtype, subtype])
        rows.append([dept_name, f"{subtype} issue", subtype])
        rows.append([dept_name, f"Complaint regarding {subtype}", subtype])

# Add Specific High-Volume/Confusing Cases
special_cases = [
    ("Transport Department (TRANS)", "Bus driver didn't stop at the bus stand", "Bus Not Stopping"),
    ("Transport Department (TRANS)", "Conductor refused to give change", "Conductor Rude Behavior"),
    ("Municipal Administration and Water Supply Department (MAWS)", "Water is not coming for 3 days", "No Water Supply"),
    ("Municipal Administration and Water Supply Department (MAWS)", "Street light flickering and not working", "Street Light Not Working"),
    ("Energy Department (ENERGY)", "Power fluctuation and low voltage", "Frequent Power Cuts"),
    ("Energy Department (ENERGY)", "Electricity bill is very high this month", "High Electricity Bill"),
    ("Public Elections Department (ELECTION)", "My name is not in the voter list", "Name Missing in Voter List"),
    ("Revenue and Disaster Management Department (REV)", "Need patta transfer for my land", "Patta / Chitta Transfer"),
    ("Health and Family Welfare Department (HEALTH)", "Doctor was not in the PHC", "Doctor Absent in GH"),
    ("Police Department", "Theft in my house", "FIR Registration Refusal"), 
    # Fix for "Pothole in centre of road" getting classified as IT (likely due to 'Centre')
    ("Highways and Minor Ports Department (HWY)", "Large pothole in centre of road", "State Highway Potholes"),
    ("Highways and Minor Ports Department (HWY)", "Road is damaged badly", "State Highway Potholes"),
    ("Highways and Minor Ports Department (HWY)", "Fix the pothole on the main road", "State Highway Potholes"),
    ("Municipal Administration and Water Supply Department (MAWS)", "Road is broken in my street", "Road Damage"),
    ("Municipal Administration and Water Supply Department (MAWS)", "Potholes need filling", "Road Damage"),
    ("Rural Development and Panchayat Raj Department (RDPR)", "Village road has huge holes", "Village Road Damaged")
]

for dept, text, subtype in special_cases:
    rows.append([dept, text, subtype])

# BASIC CATEGORY BOOSTER (Ensures common issues are never missed)
# We repeat these patterns to give them higher weight in the dataset
basic_boost = [
    ("Municipal Administration and Water Supply Department (MAWS)", "No water supply in my house", "No Water Supply"),
    ("Municipal Administration and Water Supply Department (MAWS)", "Garbage is overflowing in street", "Garbage Not Collected"),
    ("Municipal Administration and Water Supply Department (MAWS)", "Street light is dark/broken", "Street Light Not Working"),
    ("Energy Department (ENERGY)", "No electricity / Power cut", "Frequent Power Cuts"),
    ("Highways and Minor Ports Department (HWY)", "Road is full of potholes", "State Highway Potholes"),
    ("Transport Department (TRANS)", "Bus never comes on time", "Bus Not Stopping"),
    ("Health and Family Welfare Department (HEALTH)", "Hospital is very dirty", "Sanitation in Hospital"),
    ("Police Department", "Help needed urgently, crime happening", "Law and Order General") # Mapped to Police/Public
]

for _ in range(3): # Add these 3 times to boost importance
    for dept, text, subtype in basic_boost:
        rows.append([dept, text, subtype])

# Create DataFrame
df = pd.DataFrame(rows, columns=["Department", "text", "Subtype"])

# Shuffle
df = df.sample(frac=1).reset_index(drop=True)

# Save CSV
df.to_csv("tn_grievance_ml_fullname.csv", index=False)
print(f"Generated {len(df)} training examples for {len(departments_subtypes)} departments.")
