import shap
import pandas as pd

class PredictionExplainer:

    def __init__(self, model):
        self.explainer = shap.Explainer(model)

    def explain(self, input_df):

        shap_values = self.explainer(input_df)

        values = shap_values.values[0, :, 1]

        explanation = pd.DataFrame({
            "Feature": input_df.columns,
            "Impact": values,
            "Value": input_df.iloc[0].values
        })

        explanation["AbsImpact"] = explanation["Impact"].abs()

        explanation["Direction"] = explanation["Impact"].apply(
            lambda x: "Increase Risk" if x > 0 else "Decrease Risk"
        )

        explanation = explanation.sort_values(
            by="AbsImpact",
            ascending=False
        )

        return explanation
    
    def generate_recommendations(self,explanation):

        recommendations = []

        top = explanation.head(5)

        for _, row in top.iterrows():

            feature = row["Feature"]

            if "OverTime" in feature:
                recommendations.append(
                    "Reduce overtime where possible."
                )

            elif "MonthlyIncome" in feature:
                recommendations.append(
                    "Review employee compensation."
                )

            elif "YearsAtCompany" in feature:
                recommendations.append(
                    "Discuss career growth opportunities."
                )

            elif "JobSatisfaction" in feature:
                recommendations.append(
                    "Conduct an employee satisfaction meeting."
                )

            elif "DistanceFromHome" in feature:
                recommendations.append(
                    "Consider flexible work or hybrid options."
                )

        return list(dict.fromkeys(recommendations))