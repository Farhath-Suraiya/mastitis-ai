from database import SessionLocal, AnimalModel
from ml.predict import predict_single

db = SessionLocal()
test_cows = ['COW-001', 'COW-002', 'COW-250', 'COW-486', 'COW-363', 'COW-194']
for cid in test_cows:
    a = db.query(AnimalModel).filter(AnimalModel.animal_id == cid).first()
    if not a:
        print(cid + ': NOT FOUND')
        continue
    data = {col.name: getattr(a, col.name) for col in AnimalModel.__table__.columns}
    res = predict_single(data)
    score = res['risk_score']
    cat = res['risk_category']
    print(cid + ': score=' + str(score) + '% | ' + cat)
db.close()
