from sklearn.model_selection import GridSearchCV
from sklearn.model_selection import RandomizedSearchCV

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC


#logistic regression hyperparameter tuning
def tune_logistic(X_train, y_train):

    param_grid = {
        "C": [0.01, 0.1, 1, 10, 100],
        "solver": ["liblinear", "lbfgs"]
    }

    grid = GridSearchCV(
        LogisticRegression(max_iter=1000),
        param_grid,
        cv=5,
        scoring="f1",
        n_jobs=-1
    )

    grid.fit(X_train, y_train)

    return grid.best_estimator_

#decision tree hyperparameter tuning
def tune_decision_tree(X_train, y_train):

    param_grid = {
        "max_depth": [3,5,10,None],
        "min_samples_split": [2,5,10],
        "criterion": ["gini","entropy"]
    }

    grid = GridSearchCV(
        DecisionTreeClassifier(random_state=42),
        param_grid,
        cv=5,
        scoring="f1",
        n_jobs=-1
    )

    grid.fit(X_train,y_train)

    return grid.best_estimator_

#random forest hyperparameter tuning
def tune_random_forest(X_train, y_train):

    params = {
        "n_estimators":[100,200,300],
        "max_depth":[5,10,20,None],
        "min_samples_split":[2,5],
        "min_samples_leaf":[1,2,4]
    }

    search = RandomizedSearchCV(
        RandomForestClassifier(random_state=42),
        params,
        n_iter=15,
        cv=5,
        scoring="f1",
        random_state=42,
        n_jobs=-1
    )

    search.fit(X_train,y_train)

    return search.best_estimator_


#KNN hyperparameter tuning
def tune_knn(X_train, y_train):

    params = {
        "n_neighbors":[3,5,7,9,11],
        "weights":["uniform","distance"],
        "metric":["euclidean","manhattan"]
    }

    grid = GridSearchCV(
        KNeighborsClassifier(),
        params,
        cv=5,
        scoring="f1",
        n_jobs=-1
    )

    grid.fit(X_train,y_train)

    return grid.best_estimator_

#SVM hyperparameter tuning
def tune_svm(X_train, y_train):

    params = {
        "C":[0.1,1,10],
        "kernel":["linear","rbf"]
    }

    grid = GridSearchCV(
        SVC(probability=True),
        params,
        cv=5,
        scoring="f1",
        n_jobs=-1
    )

    grid.fit(X_train,y_train)

    return grid.best_estimator_