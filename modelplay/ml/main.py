from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification

app = FastAPI(title="ModelPlay ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TreeParameters(BaseModel):
    max_depth: int
    min_samples_split: int

# Generate a dummy 2D dataset
X, y = make_classification(n_samples=200, n_features=2, n_informative=2, n_redundant=0, 
                           n_clusters_per_class=1, random_state=42)

@app.get("/api/data")
def get_data():
    return {
        "X": X.tolist(),
        "y": y.tolist()
    }

@app.post("/api/train")
def train_tree(params: TreeParameters):
    clf = DecisionTreeClassifier(max_depth=params.max_depth, min_samples_split=params.min_samples_split, random_state=42)
    clf.fit(X, y)
    
    # Create a meshgrid to plot the decision boundary
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.1),
                         np.arange(y_min, y_max, 0.1))
    
    Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    
    # We will return the grid definition and the predicted z matrix
    return {
        "x_min": float(x_min),
        "x_max": float(x_max),
        "y_min": float(y_min),
        "y_max": float(y_max),
        "step": 0.1,
        "grid_Z": Z.tolist()
    }
