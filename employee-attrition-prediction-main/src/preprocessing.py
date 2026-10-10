import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def preprocess_data(path):

    df = pd.read_csv(path)

    # Remove unnecessary columns
    df.drop(
        columns=[
            "EmployeeCount",
            "Over18",
            "StandardHours",
            "EmployeeNumber"
        ],
        inplace=True
    )

    # Encode target
    df["Attrition"] = df["Attrition"].map({
        "No":0,
        "Yes":1
    })

    X = df.drop("Attrition",axis=1)
    y = df["Attrition"]

    categorical = X.select_dtypes(include="object").columns

    X = pd.get_dummies(
        X,
        columns=categorical,
        drop_first=True
    )

    X_train,X_test,y_train,y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return (
        X_train,
        X_test,
        X_train_scaled,
        X_test_scaled,
        y_train,
        y_test,
        scaler
    )

