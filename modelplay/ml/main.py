import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_moons, make_blobs
from sklearn.cluster import KMeans

app = FastAPI(title="ModelPlay ML Service")

# CORS — allow frontend origin in production, all origins in dev
allowed_origins = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origins] if allowed_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Decision Tree Dataset ───
X_dt, y_dt = make_moons(n_samples=300, noise=0.3, random_state=42)

class PredictRequest(BaseModel):
    max_depth: int
    min_samples_split: int

@app.post("/api/predict-boundary")
def predict_boundary(req: PredictRequest):
    clf = DecisionTreeClassifier(
        max_depth=req.max_depth, 
        min_samples_split=req.min_samples_split, 
        random_state=42
    )
    clf.fit(X_dt, y_dt)
    
    x_min, x_max = X_dt[:, 0].min() - 0.5, X_dt[:, 0].max() + 0.5
    y_min, y_max = X_dt[:, 1].min() - 0.5, X_dt[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.05),
                         np.arange(y_min, y_max, 0.05))
    
    Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)
    
    return {
        "data_points": {
            "x": X_dt[:, 0].tolist(),
            "y": X_dt[:, 1].tolist(),
            "classes": y_dt.tolist()
        },
        "grid": {
            "xx": xx.tolist(),
            "yy": yy.tolist(),
            "z": Z.tolist()
        }
    }

# ─── K-Means Clustering Dataset ───
X_km, _ = make_blobs(n_samples=300, centers=5, n_features=2, random_state=42)

class ClusterRequest(BaseModel):
    num_clusters: int

@app.post("/api/cluster")
def cluster_data(req: ClusterRequest):
    kmeans = KMeans(n_clusters=req.num_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_km)
    centroids = kmeans.cluster_centers_
    
    return {
        "data_points": {
            "x": X_km[:, 0].tolist(),
            "y": X_km[:, 1].tolist(),
            "labels": labels.tolist()
        },
        "centroids": {
            "x": centroids[:, 0].tolist(),
            "y": centroids[:, 1].tolist()
        }
    }
