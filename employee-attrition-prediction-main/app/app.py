"""
Streamlit app for interactive employee attrition prediction.

Run with:
    streamlit run app/app.py
"""

import os
import sys

import streamlit as st

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.predict import load_artifacts, predict  # noqa: E402

st.set_page_config(page_title="Employee Attrition Predictor", layout="centered")

st.title("Employee Attrition Predictor")
st.write("Enter employee details to estimate attrition risk.")

model, scaler, feature_columns = load_artifacts(
    model_path=os.path.join("models", "best_model.pkl"),
    scaler_path=os.path.join("models", "scaler.pkl"),
)

col1, col2 = st.columns(2)

with col1:
    age = st.number_input("Age", 18, 65, 34)
    business_travel = st.selectbox(
        "Business Travel", ["Non-Travel", "Travel_Rarely", "Travel_Frequently"]
    )
    department = st.selectbox(
        "Department", ["Sales", "Research & Development", "Human Resources"]
    )
    distance = st.number_input("Distance From Home", 0, 30, 5)
    education_field = st.selectbox(
        "Education Field",
        ["Life Sciences", "Medical", "Marketing", "Technical Degree", "Human Resources", "Other"],
    )
    gender = st.selectbox("Gender", ["Male", "Female"])
    job_role = st.selectbox(
        "Job Role",
        [
            "Sales Executive", "Research Scientist", "Laboratory Technician",
            "Manufacturing Director", "Healthcare Representative", "Manager",
            "Sales Representative", "Research Director", "Human Resources",
        ],
    )
    marital_status = st.selectbox("Marital Status", ["Single", "Married", "Divorced"])
    overtime = st.selectbox("OverTime", ["Yes", "No"])

with col2:
    monthly_income = st.number_input("Monthly Income", 1000, 20000, 5000, step=100)
    job_satisfaction = st.slider("Job Satisfaction (1-4)", 1, 4, 3)
    work_life_balance = st.slider("Work Life Balance (1-4)", 1, 4, 3)
    total_working_years = st.number_input("Total Working Years", 0, 40, 8)
    years_at_company = st.number_input("Years At Company", 0, 40, 5)
    years_in_role = st.number_input("Years In Current Role", 0, 20, 3)
    years_since_promotion = st.number_input("Years Since Last Promotion", 0, 15, 1)
    years_with_manager = st.number_input("Years With Current Manager", 0, 20, 2)
    num_companies = st.number_input("Num Companies Worked", 0, 10, 1)
    stock_option = st.slider("Stock Option Level (0-3)", 0, 3, 0)

if st.button("Predict Attrition Risk", type="primary"):
    employee = {
        "Age": age,
        "BusinessTravel": business_travel,
        "DailyRate": 800,
        "Department": department,
        "DistanceFromHome": distance,
        "Education": 3,
        "EducationField": education_field,
        "EnvironmentSatisfaction": 3,
        "Gender": gender,
        "HourlyRate": 65,
        "JobInvolvement": 3,
        "JobLevel": 2,
        "JobRole": job_role,
        "JobSatisfaction": job_satisfaction,
        "MaritalStatus": marital_status,
        "MonthlyIncome": monthly_income,
        "MonthlyRate": 15000,
        "NumCompaniesWorked": num_companies,
        "OverTime": overtime,
        "PercentSalaryHike": 12,
        "PerformanceRating": 3,
        "RelationshipSatisfaction": 3,
        "StockOptionLevel": stock_option,
        "TotalWorkingYears": total_working_years,
        "TrainingTimesLastYear": 2,
        "WorkLifeBalance": work_life_balance,
        "YearsAtCompany": years_at_company,
        "YearsInCurrentRole": years_in_role,
        "YearsSinceLastPromotion": years_since_promotion,
        "YearsWithCurrManager": years_with_manager,
    }

    result = predict(employee, model, feature_columns)

    st.subheader("Result")
    st.metric("Predicted Attrition", result["prediction"])
    st.metric("Attrition Probability", f"{result['attrition_probability']:.1%}")

    risk = result["risk_band"]
    if risk == "High":
        st.error(f"Risk Band: {risk}")
    elif risk == "Medium":
        st.warning(f"Risk Band: {risk}")
    else:
        st.success(f"Risk Band: {risk}")
