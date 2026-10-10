import pandas as pd
import matplotlib.pyplot as plt


def plot_feature_importance(model, feature_names, top_n=15):

    importance = pd.DataFrame({
        "Feature": feature_names,
        "Importance": model.feature_importances_
    })

    importance = importance.sort_values(
        by="Importance",
        ascending=False
    )

    print("\nTop Important Features")
    print(importance.head(top_n))

    plt.figure(figsize=(10,6))

    plt.barh(
        importance["Feature"][:top_n],
        importance["Importance"][:top_n]
    )

    plt.xlabel("Importance")
    plt.ylabel("Feature")
    plt.title("Top Feature Importance")

    plt.gca().invert_yaxis()

    plt.tight_layout()

    plt.show()