import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset
data = pd.read_csv("app/data/mess_training_data.csv")

# Encode categorical columns
le_day = LabelEncoder()
le_meal = LabelEncoder()

data["day"] = le_day.fit_transform(data["day"])
data["meal_type"] = le_meal.fit_transform(data["meal_type"])

# Features and target
X = data.drop("predicted_attendance", axis=1)
y = data["predicted_attendance"]

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# Save model and encoders
joblib.dump(model, "app/model/demand_model.pkl")
joblib.dump(le_day, "app/model/day_encoder.pkl")
joblib.dump(le_meal, "app/model/meal_encoder.pkl")

print("Model trained and saved successfully.")