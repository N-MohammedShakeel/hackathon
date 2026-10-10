from services.prediction_service import prediction_engine
from schemas import DashboardOverview, WatchListItem

class DashboardService:
    def get_overview(self) -> DashboardOverview:
        watchlist = prediction_engine.watchlist
        metrics = prediction_engine.metrics

        total = metrics.get("n_train_samples", 1176) + metrics.get("n_test_samples", 294)
        
        high_risk = sum(1 for item in watchlist if item.get("risk_band") == "High")
        med_risk = sum(1 for item in watchlist if item.get("risk_band") == "Medium")
        low_risk = max(0, total - high_risk - med_risk)

        # Department breakdown
        dept_counts = {}
        jobrole_counts = {}
        for item in watchlist:
            dept = item.get("department", "Unknown")
            role = item.get("job_role", "Unknown")
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
            jobrole_counts[role] = jobrole_counts.get(role, 0) + 1

        top10 = [WatchListItem(**item) for item in watchlist[:10]]

        return DashboardOverview(
            total_employees=total,
            high_risk_count=high_risk,
            medium_risk_count=med_risk,
            low_risk_count=low_risk,
            attrition_rate=metrics.get("class_imbalance_rate", 0.161),
            top_10_at_risk=top10,
            dept_breakdown=dept_counts,
            jobrole_breakdown=jobrole_counts
        )

    def get_watchlist(self):
        return prediction_engine.watchlist

dashboard_service = DashboardService()
