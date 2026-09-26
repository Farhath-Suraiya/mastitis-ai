from database import SessionLocal, AnimalModel
from analytics import get_vectorized_animal_predictions
from collections import Counter

db = SessionLocal()
animals = db.query(AnimalModel).all()
df = get_vectorized_animal_predictions(animals)
counts = Counter(df['risk_category'].tolist())
print('Risk distribution across 500 cows:')
for cat, count in counts.items():
    print('  ' + cat + ': ' + str(count) + ' cows')

# Show a sample cow for each category
for cat in counts:
    sample = df[df['risk_category'] == cat].iloc[0]
    print('  Sample ' + cat + ': ' + sample['animal_id'] + ' score=' + str(sample['risk_score']) + '%')
db.close()
