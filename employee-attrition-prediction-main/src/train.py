from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

def train_models(
    X_train,
    X_train_scaled,
    y_train
):

    models = {}

    models["Logistic Regression"] = LogisticRegression(max_iter=1000)

    models["Decision Tree"] = DecisionTreeClassifier(random_state=42)

    models["Random Forest"] = RandomForestClassifier(
        n_estimators=200,
        random_state=42
    )

    models["KNN"] = KNeighborsClassifier()

    models["SVM"] = SVC(
        probability=True,
        random_state=42
    )

    trained = {}

    trained["Logistic Regression"] = models["Logistic Regression"].fit(
        X_train_scaled,
        y_train
    )

    trained["Decision Tree"] = models["Decision Tree"].fit(
        X_train,
        y_train
    )

    trained["Random Forest"] = models["Random Forest"].fit(
        X_train,
        y_train
    )

    trained["KNN"] = models["KNN"].fit(
        X_train_scaled,
        y_train
    )

    trained["SVM"] = models["SVM"].fit(
        X_train_scaled,
        y_train
    )

    return trained